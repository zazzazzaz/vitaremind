import { MedicationForm, MealTiming } from '../types';

export interface MedicationVariant {
  name: string;
  dosage: string;
  form: MedicationForm;
  instructions: MealTiming;
  stockCount: number;
  notes: string;
}

// Built-in verified Turkish pharmacy medication database for instantaneous response and offline support
export const commonTurkishMedications: Record<string, MedicationVariant[]> = {
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
  lansor: [
    {
      name: 'Lansor 30 mg Mikropellet Kapsül',
      dosage: '30 mg',
      form: 'capsule',
      instructions: 'before_meal',
      stockCount: 28,
      notes: 'Lansoprazol içeren mide koruyucu. Sabah kahvaltıdan önce aç karnına bir bardak su ile çiğnenmeden yutulur.',
    },
    {
      name: 'Lansor 15 mg Mikropellet Kapsül',
      dosage: '15 mg',
      form: 'capsule',
      instructions: 'before_meal',
      stockCount: 28,
      notes: 'İdame tedavisi için düşük doz lansoprazol. Sabah aç karnına alınır.',
    },
  ],
  euthyrox: [
    {
      name: 'Euthyrox 25 mcg Tablet',
      dosage: '25 mcg',
      form: 'tablet',
      instructions: 'before_meal',
      stockCount: 50,
      notes: 'Levotiroksin sodyum (tiroid hormonu). Sabah kahvaltıdan en az 30 dakika önce sadece su ile aç karnına alınmalıdır. Kalsiyum ve demir ilaçlarıyla en az 4 saat ara verilmelidir.',
    },
    {
      name: 'Euthyrox 50 mcg Tablet',
      dosage: '50 mcg',
      form: 'tablet',
      instructions: 'before_meal',
      stockCount: 50,
      notes: 'Levotiroksin tiroid ilacı. Sabah aç karnına düzenli olarak aynı saatte alınır.',
    },
    {
      name: 'Euthyrox 100 mcg Tablet',
      dosage: '100 mcg',
      form: 'tablet',
      instructions: 'before_meal',
      stockCount: 50,
      notes: 'Tiroid hormonu eksikliği tedavisinde standart doz. Sabah aç karnına alınmalıdır.',
    },
  ],
  apranax: [
    {
      name: 'Apranax 275 mg Film Tablet',
      dosage: '275 mg',
      form: 'tablet',
      instructions: 'after_meal',
      stockCount: 20,
      notes: 'Naproksen sodyum içeren antienflamatuar ve ağrı kesici. Mide yanmasını önlemek için tok karnına bol su ile alınır.',
    },
    {
      name: 'Apranax Fort 550 mg Film Tablet',
      dosage: '550 mg',
      form: 'tablet',
      instructions: 'after_meal',
      stockCount: 20,
      notes: 'Yüksek doz naproksen sodyum. Şiddetli kas-eklem ağrıları ve diş ağrılarında tok karnına alınır.',
    },
  ],
  majezik: [
    {
      name: 'Majezik 100 mg Film Tablet',
      dosage: '100 mg',
      form: 'tablet',
      instructions: 'after_meal',
      stockCount: 15,
      notes: 'Flurbiprofen içeren güçlü antienflamatuar ağrı kesici. Yemekten sonra bol su ile alınmalıdır.',
    },
    {
      name: 'Majezik %0.25 Oral Sprey (Gargara/Sprey)',
      dosage: '2-3 Püskürtme',
      form: 'spray',
      instructions: 'after_meal',
      stockCount: 30,
      notes: 'Boğaz ağrısı ve ağız içi iltihaplar için lokal uygulanan sprey.',
    },
  ],
  arveles: [
    {
      name: 'Arveles 25 mg Film Tablet',
      dosage: '25 mg',
      form: 'tablet',
      instructions: 'after_meal',
      stockCount: 20,
      notes: 'Deksketoprofen trometamol hızlı etkili ağrı kesici. Akut ağrılarda tok karnına bol su ile alınır.',
    },
  ],
  benexol: [
    {
      name: 'Benexol B12 Film Tablet',
      dosage: '1 Tablet (B1, B6, B12)',
      form: 'tablet',
      instructions: 'after_meal',
      stockCount: 30,
      notes: 'B1, B6 ve B12 vitamin kompleksi. Sinir sistemi sağlığı ve halsizlik için tok karnına su ile alınır.',
    },
  ],
  magvital: [
    {
      name: 'Magvital 365 mg Efervesan Saşe',
      dosage: '365 mg',
      form: 'syrup',
      instructions: 'after_meal',
      stockCount: 30,
      notes: 'Magnezyum takviyesi. Bir bardak suda eritilerek tok karnına veya akşam yatmadan önce içilir.',
    },
  ],
};

/**
 * Searches medicine variants using AI backend with local fallback
 */
export async function searchMedicationVariants(
  query: string,
  userApiKey?: string
): Promise<MedicationVariant[]> {
  const clean = query.trim().toLowerCase();
  if (!clean) return [];

  // Try backend AI route first
  try {
    const res = await fetch('/api/ai/search-medication', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, userApiKey }),
    });

    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        return json.data;
      }
    }
  } catch (err) {
    console.warn('Backend AI search error, falling back to local database:', err);
  }

  // Fallback: check local database
  const matchedKey = Object.keys(commonTurkishMedications).find(
    (k) => clean.includes(k) || k.includes(clean)
  );

  if (matchedKey) {
    return commonTurkishMedications[matchedKey];
  }

  // Generic fallback if completely offline and unknown query
  return [
    {
      name: `${query.trim()} Tablet`,
      dosage: '1 Tablet',
      form: 'tablet',
      instructions: 'after_meal',
      stockCount: 30,
      notes: `${query.trim()} için standart doz ve kullanım önerisi. Doktorunuzun veya eczacınızın tavsiyesine göre kullanınız.`,
    },
  ];
}

/**
 * Compresses and resizes camera photo before sending to prevent payload limit errors (413)
 * and network timeouts on mobile phones.
 */
export async function resizeAndCompressImage(file: File, maxDim = 1200, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Dosya okunamadı.'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Görsel formatı desteklenmiyor.'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedBase64);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Scans medication box image using backend AI route with direct client-side fallback
 */
export async function scanMedicationImage(
  imageBase64: string,
  userApiKey?: string
): Promise<any> {
  const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z]+;base64,/, '');

  // 1. Try Backend endpoint first
  try {
    const response = await fetch('/api/ai/scan-medication', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageBase64: cleanBase64,
        mimeType: 'image/jpeg',
        userApiKey,
      }),
    });

    const responseText = await response.text();
    if (responseText && responseText.trim().startsWith('{')) {
      const result = JSON.parse(responseText);
      if (response.ok && result.success && result.data) {
        return result.data;
      }
      if (result.error && !userApiKey) {
        throw new Error(result.error);
      }
    }
  } catch (err: any) {
    console.warn('Backend OCR scan failed, checking direct Gemini fallback:', err.message);
    if (!userApiKey) {
      throw err;
    }
  }

  // 2. Direct client-side Gemini fallback (essential for static Vercel / Netlify deployments)
  if (userApiKey) {
    try {
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${encodeURIComponent(userApiKey)}`;
      const promptText = 
        'Bu görsel bir ilaç kutusu, şişesi, reçetesi veya prospektüsüdür. ' +
        'Lütfen görseli dikkatle inceleyerek ilacın adını (name), dozajını/miktarını (dosage, örn: 500 mg, 1 Tablet vb.), ' +
        'ilaç formunu (tablet, capsule, syrup, injection, drop, spray, inhaler, cream, other seçeneklerinden biri), ' +
        'kullanım talimatını (before_meal, after_meal, with_meal, anytime), ' +
        'kutudaki adet sayısını (stockCount) ve kısa kullanım/uyarı notlarını (notes) içeren geçerli bir JSON üret: ' +
        '{"name":"...","dosage":"...","form":"tablet","instructions":"after_meal","stockCount":30,"notes":"..."}';

      const directRes = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { inlineData: { mimeType: 'image/jpeg', data: cleanBase64 } },
                { text: promptText },
              ],
            },
          ],
          generationConfig: {
            responseMimeType: 'application/json',
          },
        }),
      });

      const directText = await directRes.text();
      if (directRes.ok && directText && directText.trim().startsWith('{')) {
        const parsed = JSON.parse(directText);
        const outputJsonStr = parsed?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (outputJsonStr) {
          return JSON.parse(outputJsonStr);
        }
      }
    } catch (directErr: any) {
      console.warn('Direct Gemini API fallback failed:', directErr);
    }
  }

  throw new Error('İlaç kutusu okunamadı. Lütfen fotoğrafın net olduğundan veya Ayarlar sekmesinde ücretsiz Google Gemini API anahtarınızın girildiğinden emin olun.');
}
