import express from 'express';
import http from 'http';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { GoogleGenAI, Type } from '@google/genai';

async function startServer() {
  const app = express();
  const port = process.env.PORT || 3000;

  app.use(express.json({ limit: '30mb' }));

  // AI Medication Scanner endpoint
  app.post('/api/ai/scan-medication', async (req, res) => {
    try {
      const { imageBase64, mimeType, userApiKey } = req.body;
      if (!imageBase64) {
        return res.status(400).json({ error: 'Görsel verisi bulunamadı.' });
      }

      const apiKey = userApiKey || process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(400).json({ 
          error: 'Gemini API anahtarı bulunamadı. Lütfen Ayarlar sekmesinden kendi ücretsiz Google Gemini API anahtarınızı giriniz.' 
        });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z]+;base64,/, '');

      const modelsToTry = ['gemini-3.1-flash-lite', 'gemini-3.8-flash'];
      let parsedData: any = null;
      let lastErrorMessage = '';

      const promptText = 
        'Bu görsel bir ilaç kutusu, şişesi, reçetesi veya prospektüsüdür. ' +
        'Lütfen görseli dikkatle inceleyerek ilacın adını ve kullanım bilgilerini tespit et. ' +
        'YALNIZCA geçerli bir JSON nesnesi döndür: ' +
        '{\n' +
        '  "name": "İlacın ticari ve etken adı (Örn: Parol 500 mg Tablet)",\n' +
        '  "dosage": "Doz veya miktar (Örn: 500 mg, 1 Tablet, 1 Ölçek)",\n' +
        '  "form": "tablet | capsule | syrup | injection | drop | spray | inhaler | cream | other",\n' +
        '  "instructions": "before_meal | after_meal | with_meal | anytime",\n' +
        '  "stockCount": 30,\n' +
        '  "notes": "Önemli kullanım uyarısı veya kısa açıklama"\n' +
        '}\n' +
        'Eğer görselde ilaç adı bulunamıyorsa name alanına "Bilinmiyor" yaz. Hiçbir markdown etiketi (```json) eklemeden sadece saf JSON döndür.';

      for (const modelName of modelsToTry) {
        try {
          const response = await ai.models.generateContent({
            model: modelName,
            contents: [
              {
                role: 'user',
                parts: [
                  {
                    inlineData: {
                      mimeType: mimeType || 'image/jpeg',
                      data: cleanBase64,
                    },
                  },
                  {
                    text: promptText,
                  },
                ],
              },
            ],
            config: {
              responseMimeType: 'application/json',
            },
          });

          const rawText = response.text || '';
          if (rawText && rawText.trim()) {
            // Clean markdown fences if any
            let cleanText = rawText.trim();
            cleanText = cleanText.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/g, '').trim();

            let candidateObj: any = null;
            try {
              candidateObj = JSON.parse(cleanText);
            } catch {
              const start = cleanText.indexOf('{');
              const end = cleanText.lastIndexOf('}');
              if (start !== -1 && end > start) {
                try {
                  candidateObj = JSON.parse(cleanText.slice(start, end + 1));
                } catch {}
              }
            }

            if (candidateObj && candidateObj.name && candidateObj.name !== 'Bilinmiyor' && candidateObj.name !== 'N/A') {
              // Normalize form
              let form = 'tablet';
              const f = String(candidateObj.form || '').toLowerCase();
              if (f.includes('kapsül') || f.includes('capsule')) form = 'capsule';
              else if (f.includes('şurup') || f.includes('syrup')) form = 'syrup';
              else if (f.includes('damla') || f.includes('drop')) form = 'drop';
              else if (f.includes('sprey') || f.includes('spray')) form = 'spray';
              else if (f.includes('iğne') || f.includes('enjek') || f.includes('inj')) form = 'injection';
              else if (f.includes('krem') || f.includes('merhem') || f.includes('cream')) form = 'cream';
              else if (f.includes('inhaler') || f.includes('fıs')) form = 'inhaler';
              else if (f.includes('diğer') || f.includes('other')) form = 'other';

              // Normalize instructions
              let instructions = 'after_meal';
              const inst = String(candidateObj.instructions || '').toLowerCase();
              if (inst.includes('aç') || inst.includes('before')) instructions = 'before_meal';
              else if (inst.includes('yemekle') || inst.includes('with') || inst.includes('birlikte')) instructions = 'with_meal';
              else if (inst.includes('fark') || inst.includes('anytime') || inst.includes('zaman')) instructions = 'anytime';
              else if (inst.includes('tok') || inst.includes('after')) instructions = 'after_meal';

              parsedData = {
                name: candidateObj.name.trim(),
                dosage: candidateObj.dosage ? String(candidateObj.dosage).trim() : '1 Doz',
                form,
                instructions,
                stockCount: Number(candidateObj.stockCount) > 0 ? Number(candidateObj.stockCount) : 30,
                notes: candidateObj.notes ? String(candidateObj.notes).trim() : '',
              };
              break;
            }
          }
        } catch (err: any) {
          lastErrorMessage = err.message || '';
          console.warn(`Vision model ${modelName} failed:`, lastErrorMessage);
        }
      }

      if (parsedData) {
        return res.json({ success: true, data: parsedData });
      }

      return res.status(422).json({
        error: 'Fotoğraftan ilaç kutusu veya adı okunamadı. Lütfen kutu üzerindeki yazının net göründüğü bir fotoğraf çekiniz veya yukarıdaki arama kutusuna ilacın adını yazınız.',
      });
    } catch (err: any) {
      console.error('Gemini OCR Error:', err);
      return res.status(500).json({
        error: 'Görsel analiz edilirken bir hata oluştu. Lütfen tekrar deneyiniz veya ilacın adını yazarak aratınız.',
      });
    }
  });

  // AI Medication Search by Name endpoint
  app.post('/api/ai/search-medication', async (req, res) => {
    try {
      const { query, userApiKey } = req.body;
      if (!query || typeof query !== 'string' || !query.trim()) {
        return res.status(400).json({ error: 'Lütfen bir ilaç veya etken madde adı giriniz.' });
      }

      const cleanQuery = query.trim().toLowerCase();

      // Common Turkish pharmacy medications preset fallback
      const commonMedsMap: Record<string, any[]> = {
        coraspin: [
          {
            name: 'Coraspin 100 mg Enterik Kaplı Tablet',
            dosage: '100 mg',
            form: 'tablet',
            instructions: 'after_meal',
            stockCount: 30,
            notes: 'Asetilsalisilik asit içeren koruyucu kan sulandırıcı. Mideyi korumak amacıyla tok karnına, bol su ile bütün olarak yutulmalıdır.',
          },
          {
            name: 'Coraspin 300 mg Enterik Kaplı Tablet',
            dosage: '300 mg',
            form: 'tablet',
            instructions: 'after_meal',
            stockCount: 30,
            notes: 'Yüksek doz koruyucu kan sulandırıcı (antiagregan). Kardiyovasküler koruma için hekim tavsiyesiyle tok karnına alınır.',
          },
        ],
        parol: [
          {
            name: 'Parol 500 mg Tablet',
            dosage: '500 mg',
            form: 'tablet',
            instructions: 'anytime',
            stockCount: 20,
            notes: 'Parasetamol içeren ağrı kesici ve ateş düşürücü. Mideye dokunmaz, aç veya tok karnına bol su ile alınabilir.',
          },
          {
            name: 'Parol Plus Tablet',
            dosage: '250mg Parasetamol + 150mg Propifenazon + 50mg Kafein',
            form: 'tablet',
            instructions: 'after_meal',
            stockCount: 30,
            notes: 'Kafein takviyeli güçlü ağrı kesici. Baş ağrısı ve migrende etkilidir. Tok karnına alınması önerilir.',
          },
          {
            name: 'Parol 120 mg/5 ml Şurup (Pediatrik)',
            dosage: '1 Ölçek (5 ml)',
            form: 'syrup',
            instructions: 'anytime',
            stockCount: 150,
            notes: 'Çocuklar ve bebekler için parasetamol şurubu. Ateş ve hafif ağrılarda kullanılır.',
          },
        ],
        nexium: [
          {
            name: 'Nexium 20 mg Gastro-rezistan Tablet',
            dosage: '20 mg',
            form: 'tablet',
            instructions: 'before_meal',
            stockCount: 28,
            notes: 'Esomeprazol içeren mide asidi baskılayıcı (PPI). Sabahları kahvaltıdan en az 30-60 dakika önce aç karnına alınmalıdır.',
          },
          {
            name: 'Nexium 40 mg Gastro-rezistan Tablet',
            dosage: '40 mg',
            form: 'tablet',
            instructions: 'before_meal',
            stockCount: 28,
            notes: 'Reflü ve mide ülseri tedavisinde yüksek doz proton pompa inhibitörü. Sabah aç karnına çiğnenmeden yutulur.',
          },
        ],
        augmentin: [
          {
            name: 'Augmentin BID 1000 mg Film Tablet',
            dosage: '1000 mg (1 g)',
            form: 'tablet',
            instructions: 'with_meal',
            stockCount: 14,
            notes: 'Amoksisilin + Klavulanik asit geniş spektrumlu antibiyotik. Mide rahatsızlığını önlemek için yemeklerin başlangıcında alınmalıdır. 12 saatte bir düzenli içilmelidir.',
          },
          {
            name: 'Augmentin BID 625 mg Film Tablet',
            dosage: '625 mg',
            form: 'tablet',
            instructions: 'with_meal',
            stockCount: 14,
            notes: 'Geniş spektrumlu antibiyotik. Hekimin belirttiği sürece aralıksız, yemek başlangıcında alınmalıdır.',
          },
          {
            name: 'Augmentin BID 400/57 mg Oral Süspansiyon (Şurup)',
            dosage: '1 Ölçek',
            form: 'syrup',
            instructions: 'with_meal',
            stockCount: 100,
            notes: 'Pediatrik süspansiyon. Buzdolabında saklanmalı, her kullanımdan önce iyice çalkalanmalıdır.',
          },
        ],
      };

      const matchedKey = Object.keys(commonMedsMap).find((k) => cleanQuery.includes(k) || k.includes(cleanQuery));

      const apiKey = userApiKey || process.env.GEMINI_API_KEY;
      if (!apiKey) {
        if (matchedKey) {
          return res.json({ success: true, data: commonMedsMap[matchedKey] });
        }
        return res.status(400).json({
          error: 'Gemini API anahtarı bulunamadı. Lütfen Ayarlar sekmesinden kendi Google Gemini API anahtarınızı giriniz.',
        });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      // Try gemini-3.1-flash-lite first, fallback to gemini-3.8-flash
      const modelsToTry = ['gemini-3.1-flash-lite', 'gemini-3.8-flash'];
      let parsedVariants: any[] = [];
      let lastError: any = null;

      for (const modelName of modelsToTry) {
        try {
          const response = await ai.models.generateContent({
            model: modelName,
            contents: [
              {
                role: 'user',
                parts: [
                  {
                    text: `Kullanıcı "${query.trim()}" ilacını veya takviyesini arıyor. ` +
                          `Lütfen Türkiye eczanelerinde ve tıbbi standartlarda bu ilaca veya etken maddeye ait yaygın ticari varyantları (örneğin miligram, tablet/kapsül/şurup formları vb.) sırala. En yaygın 2 ila 5 farklı varyantı listele. ` +
                          `Her varyant için: ticari adı (name), spesifik dozu (dosage, örn: 100 mg, 500 mg, 1 Tablet vb.), formunu (tablet, capsule, syrup, injection, drop, spray, inhaler, cream, other seçeneklerinden biri), ` +
                          `aç/tok kullanım tavsiyesini (before_meal, after_meal, with_meal, anytime), kutudaki standart adet sayısını (stockCount, örn: 20, 28, 30) ` +
                          `ve kullanıcıya yönelik önemli bir açıklama notunu (notes, örn: Ne için kullanılır, nelere dikkat edilmeli) Türkçe olarak hazırla.`,
                  },
                ],
              },
            ],
            config: {
              responseMimeType: 'application/json',
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  variants: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        name: { type: Type.STRING, description: 'İlacın tam ticari adı ve çeşidi' },
                        dosage: { type: Type.STRING, description: 'Dozaj (örn: 100 mg, 500 mg)' },
                        form: {
                          type: Type.STRING,
                          enum: ['tablet', 'capsule', 'syrup', 'injection', 'drop', 'spray', 'inhaler', 'cream', 'other'],
                        },
                        instructions: {
                          type: Type.STRING,
                          enum: ['before_meal', 'after_meal', 'with_meal', 'anytime'],
                        },
                        stockCount: { type: Type.INTEGER, description: 'Kutudaki standart hap/adet sayısı' },
                        notes: { type: Type.STRING, description: 'Kullanım amacı ve dikkat edilecekler' },
                      },
                      required: ['name', 'dosage', 'form', 'instructions', 'notes'],
                    },
                  },
                },
                required: ['variants'],
              },
            },
          });

          const text = response.text || '{"variants":[]}';
          const parsedData = JSON.parse(text);
          if (Array.isArray(parsedData.variants) && parsedData.variants.length > 0) {
            parsedVariants = parsedData.variants;
            break;
          }
        } catch (err: any) {
          lastError = err;
          console.warn(`Model ${modelName} failed, trying next:`, err.message);
        }
      }

      if (parsedVariants.length > 0) {
        return res.json({ success: true, data: parsedVariants });
      }

      // If AI failed or returned empty but we have matched fallback
      if (matchedKey) {
        return res.json({ success: true, data: commonMedsMap[matchedKey] });
      }

      throw lastError || new Error('İlaç varyantları listelenemedi.');
    } catch (err: any) {
      console.error('Gemini Search Error:', err);
      return res.status(500).json({
        error: err.message || 'İlaç aranırken bir hata oluştu.',
      });
    }
  });

  // Explicitly serve sw.js with application/javascript so Chrome accepts it as ServiceWorker
  app.get('/sw.js', (req, res) => {
    const swPath = path.resolve('public/sw.js');
    if (fs.existsSync(swPath)) {
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
      res.setHeader('Service-Worker-Allowed', '/');
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
      return res.sendFile(swPath);
    }
    res.status(404).send('Not found');
  });

  // Explicitly serve manifest.json
  app.get('/manifest.json', (req, res) => {
    const manifestPath = path.resolve('public/manifest.json');
    if (fs.existsSync(manifestPath)) {
      res.setHeader('Content-Type', 'application/manifest+json; charset=utf-8');
      return res.sendFile(manifestPath);
    }
    res.status(404).send('Not found');
  });

  // Serve public assets (icons, manifest, sw)
  app.use(express.static(path.resolve('public'), {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('sw.js')) {
        res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
        res.setHeader('Service-Worker-Allowed', '/');
      } else if (filePath.endsWith('manifest.json')) {
        res.setHeader('Content-Type', 'application/manifest+json; charset=utf-8');
      }
    }
  }));

  const server = http.createServer(app);

  // Mount Vite middleware in development
  const vite = await createViteServer({
    server: { 
      middlewareMode: true,
      hmr: { server },
    },
    appType: 'spa',
  });

  app.use(vite.middlewares);

  server.listen(port, '0.0.0.0', () => {
    console.log(`Server running on port ${port}`);
  });
}

startServer();
