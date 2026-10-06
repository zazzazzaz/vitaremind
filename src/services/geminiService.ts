import { GoogleGenAI, Type } from '@google/genai';

function cleanApiKey(rawKey: string): string {
  if (!rawKey) return '';
  return rawKey
    .trim()
    .replace(/[\u201C\u201D\u2018\u2019"]/g, '') // remove smart quotes
    .replace(/[^\x20-\x7E]/g, ''); // keep ASCII printable chars only
}

/**
 * Reçete veya İlaç Kutusu Görselini Gemini ile Analiz Etme (Otomatik Model Yedekleme Zinciri ile)
 */
export async function scanMedicationImage(imageBase64: string, mimeType: string = 'image/jpeg') {
  const rawKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || (typeof window !== 'undefined' ? localStorage.getItem('vitaremind_gemini_api_key') || '' : '');
  const apiKey = cleanApiKey(rawKey);

  if (!apiKey) {
    throw new Error('Lütfen Ayarlar sayfasından Google Gemini API Anahtarınızı (AIzaSy...) tanımlayınız.');
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
Aşağıdaki görsel bir ilaç kutusu, reçete, prospektüs veya takviye gıda ambalajıdır.
Lütfen bu görseli incele ve ilacın bilgilerini tespit ederek tam olarak belirtilen JSON formatında geri döndür:

- name: İlaç veya takviye adı (Örn: Parol, Omega 3, Magnezyum Sitrat)
- dosage: Önerilen veya tek doz miktarı (Örn: "500 mg", "1 Tablet", "1 Kapsül", "1 Ölçek")
- form: "tablet" | "capsule" | "syrup" | "drop" | "spray" | "injection" | "inhaler" | "cream" | "other"
- instructions: "before_meal" (Aç karnına) | "after_meal" (Tok karnına) | "with_meal" (Yemekle birlikte) | "anytime" (Fark etmez)
- defaultTimes: İlacın kullanım sıklığına göre önerilen saatler (Günde 1 ise ["09:00"], günde 2 ise ["09:00", "21:00"], günde 3 ise ["08:00", "14:00", "20:00"])
- stockCount: Ambalajda belirtilen toplam tablet/kapsül adedi (tespit edilemiyorsa 30)
- notes: Kullanım tavsiyesi veya saklama uyarısı
`;

  const customModel = typeof window !== 'undefined' ? localStorage.getItem('vitaremind_gemini_model') : '';
  const modelsToTry = Array.from(new Set([
    customModel,
    'gemini-3.8-flash',
    'gemini-2.0-flash',
    'gemini-1.5-flash',
    'gemini-flash-latest'
  ].filter(Boolean))) as string[];

  let lastError: any = null;

  for (const model of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: [
          {
            role: 'user',
            parts: [
              {
                inlineData: {
                  data: imageBase64,
                  mimeType,
                },
              },
              { text: prompt },
            ],
          },
        ],
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              dosage: { type: Type.STRING },
              form: { type: Type.STRING },
              instructions: { type: Type.STRING },
              defaultTimes: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              stockCount: { type: Type.INTEGER },
              notes: { type: Type.STRING },
            },
            required: ['name', 'dosage', 'form', 'instructions', 'defaultTimes'],
          },
        },
      });

      if (response.text) {
        return JSON.parse(response.text);
      }
    } catch (err: any) {
      lastError = err;
      const errStr = err?.message || String(err);
      // If API key is invalid, don't try other models, throw immediately
      if (
        errStr.includes('API_KEY_INVALID') ||
        errStr.includes('API key not valid') ||
        errStr.includes('INVALID_ARGUMENT')
      ) {
        throw new Error(
          'Girdiğiniz Google Gemini API anahtarı geçersiz. Lütfen Ayarlar sayfasından aistudio.google.dev adresinden aldığınız geçerli API anahtarınızı (AIzaSy...) girdiğinizden emin olun.'
        );
      }
      // If 404 / NOT_FOUND, continue to next model in fallback list
      if (errStr.includes('404') || errStr.includes('NOT_FOUND') || errStr.includes('is no longer available')) {
        continue;
      }
    }
  }

  throw lastError || new Error('İlaç bilgisi okunamadı. Lütfen görselin net olduğundan emin olun.');
}
