import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { GoogleGenAI, Type } from '@google/genai';

async function startServer() {
  const app = express();
  const port = process.env.PORT || 3000;

  app.use(express.json({ limit: '15mb' }));

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

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: [
          {
            role: 'user',
            parts: [
              {
                inlineData: {
                  mimeType: mimeType || 'image/jpeg',
                  data: imageBase64.replace(/^data:image\/[a-zA-Z]+;base64,/, ''),
                },
              },
              {
                text: 'Bu görsel bir ilaç kutusu, şişesi, reçetesi veya prospektüsüdür. ' +
                      'Lütfen görseli inceleyerek ilacın adını, dozajını/miktarını (örn: 500 mg, 1 Tablet vb.), ' +
                      'ilaç formunu (tablet, capsule, syrup, injection, drop, spray, inhaler, cream, other seçeneklerinden biri), ' +
                      'kullanım talimatını (before_meal: aç, after_meal: tok, with_meal: yemekle, anytime: fark etmez), ' +
                      'kalan tahmini veya kutudaki toplam adet sayısını ve varsa önemli kullanım notlarını Türkçe olarak çıkar.',
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
      const parsedData = JSON.parse(text);
      return res.json({ success: true, data: parsedData });
    } catch (err: any) {
      console.error('Gemini OCR Error:', err);
      return res.status(500).json({
        error: err.message || 'Görsel analiz edilirken bir hata oluştu.',
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