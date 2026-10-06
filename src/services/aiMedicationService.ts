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
