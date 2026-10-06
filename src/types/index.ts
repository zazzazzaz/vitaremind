export type MedicationForm = 
  | 'tablet' 
  | 'capsule' 
  | 'syrup' 
  | 'injection' 
  | 'drop' 
  | 'spray' 
  | 'inhaler' 
  | 'cream' 
  | 'other';

export type MealTiming = 'before_meal' | 'after_meal' | 'with_meal' | 'anytime';

export type MedicationColor = 'emerald' | 'sky' | 'violet' | 'amber' | 'rose' | 'indigo' | 'teal';

export interface Medication {
  id: string;
  name: string;
  dosage: string; // e.g. "500 mg", "1 adet", "2 damla"
  form: MedicationForm;
  color: MedicationColor;
  times: string[]; // ["08:00", "20:00"]
  daysOfWeek?: number[]; // [1,2,3,4,5] or empty for everyday
  instructions: MealTiming; // Aç karnına, Tok karnına, Yemekle, Fark etmez
  stockEnabled: boolean;
  stockCount: number; // Kalan hap sayısı
  stockAlertThreshold: number; // e.g. 5
  notes?: string;
  active: boolean;
  createdAt: string;
}

export interface DoseLog {
  id: string;
  medId: string;
  scheduledTime: string; // "09:00"
  date: string; // "YYYY-MM-DD"
  status: 'taken' | 'skipped' | 'snoozed';
  actualTime?: string; // ISO string
  snoozeUntil?: string; // ISO string
  notes?: string;
}

export interface WaterLog {
  id: string;
  amountMl: number;
  timestamp: string; // ISO string
  date: string; // "YYYY-MM-DD"
}

export interface WaterSettings {
  dailyGoalMl: number; // e.g. 2500
  reminderEnabled: boolean;
  intervalMinutes: number; // e.g. 60
  startTime: string; // "08:30"
  endTime: string; // "23:00"
  soundTone: 'drop' | 'gentle' | 'bell' | 'marimba';
  quickAmounts: number[]; // [150, 200, 250, 330, 500]
}

export interface AppSettings {
  userName: string;
  geminiApiKey?: string;
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  soundVolume: number; // 0 - 100
  vibrationEnabled: boolean;
  reminderTone: 'gentle' | 'chime' | 'digital' | 'zen';
}

export interface ActiveAlarm {
  id: string;
  type: 'medication' | 'water';
  title: string;
  description: string;
  medication?: Medication;
  scheduledTime?: string;
  timestamp: string;
}
