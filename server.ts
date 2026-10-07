import express from 'express';
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
                    inlineData: {
                      mimeType: mimeType || 'image/jpeg',
                      data: cleanBase64,
                    },
                  },
                  {
                    text: 'Bu görsel bir ilaç kutusu, şişesi, reçetesi veya prospektüsüdür. ' +
                          'Lütfen görseli dikkatle inceleyerek ilacın adını (name), dozajını/miktarını (dosage, örn: 500 mg, 1 Tablet vb.), ' +
                          'ilaç formunu (tablet, capsule, syrup, injection, drop, spray, inhaler, cream, other seçeneklerinden biri), ' +
                          'kullanım talimatını (before_meal: aç, after_meal: tok, with_meal: yemekle, anytime: fark etmez), ' +
                          'kalan tahmini veya kutudaki toplam adet sayısını (stockCount) ve varsa önemli kullanım notlarını (notes) Türkçe olarak çıkar.',
                  },
                ],
              },
            ],
            config: {
              responseMimeType: 'application/json',
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  name: {
                    type: Type.STRING,
                    description: 'İlacın veya takviyenin ticari/etken adı',
                  },
                  dosage: {
                    type: Type.STRING,
                    description: 'Doz veya ölçü (Örn: 500 mg, 1 Kapsül)',
                  },
                  form: {
                    type: Type.STRING,
                    enum: ['tablet', 'capsule', 'syrup', 'injection', 'drop', 'spray', 'inhaler', 'cream', 'other'],
                    description: 'İlacın formu',
                  },
                  instructions: {
                    type: Type.STRING,
                    enum: ['before_meal', 'after_meal', 'with_meal', 'anytime'],
                    description: 'Kullanım zamanı',
                  },
                  stockCount: {
                    type: Type.INTEGER,
                    description: 'Kutudaki toplam veya kalan hap/adet sayısı',
                  },
                  notes: {
                    type: Type.STRING,
                    description: 'Kullanım uyarısı veya açıklayıcı kısa not',
                  },
                },
                required: ['name', 'form', 'instructions'],
              },
            },
          });

          const text = response.text || '{}';
          const data = JSON.parse(text);
          if (data && data.name) {
            parsedData = data;
            break;
          }
        } catch (err: any) {
          lastError = err;
          console.warn(`Vision model ${modelName} failed:`, err.message);
        }
      }

      if (parsedData) {
        return res.json({ success: true, data: parsedData });
      }

      throw lastError || new Error('Görselden ilaç bilgisi okunamadı.');
    } catch (err: any) {
      console.error('Gemini OCR Error:', err);
      return res.status(500).json({
        error: err.message || 'Görsel analiz edilirken bir hata oluştu.',
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

  // Mount Vite middleware in development
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });

  app.use(vite.middlewares);

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on port ${port}`);
  });
}

startServer();
