export type MedicationForm = 
  | 'tablet' 
  | 'capsule' 
  | 'syrup' 
  | 'drop' 
  | 'spray' 
  | 'injection' 
  | 'inhaler' 
  | 'cream' 
  | 'other';

export type MedicationColor = 'emerald' | 'teal' | 'sky' | 'indigo' | 'violet' | 'amber' | 'rose';

export type MealTiming = 'before_meal' | 'after_meal' | 'with_meal' | 'anytime';

export interface Medication {
  id: string;
  name: string;
  dosage: string; // e.g. "500 mg", "1 Tablet"
  form: MedicationForm;
  color: MedicationColor;
  times: string[]; // e.g. ["08:00", "20:00"]
  daysOfWeek: number[]; // 0=Sun, 1=Mon, ..., 6=Sat. Empty array means everyday
  instructions: MealTiming;
  stockEnabled: boolean;
  stockCount: number;
  stockAlertThreshold: number; // e.g. alert when <= 5
  notes?: string;
  active: boolean;
  createdAt: string;
}

export interface DoseLog {
  id: string;
  medId: string;
  scheduledTime: string; // HH:mm
  date: string; // YYYY-MM-DD
  status: 'taken' | 'skipped' | 'snoozed';
  actualTime: string; // ISO
  snoozeUntil?: string; // ISO
  notes?: string;
}

export interface WaterLog {
  id: string;
  amountMl: number;
  timestamp: string; // ISO
  date: string; // YYYY-MM-DD
}

export interface WaterSettings {
  dailyGoalMl: number; // default 2500
  intervalMinutes: number; // default 60 (remind every 1 hour)
  startTime: string; // e.g. "08:00"
  endTime: string; // e.g. "23:00"
  reminderEnabled: boolean;
}

export interface AppSettings {
  userName: string;
  theme?: 'light' | 'dark' | 'system';
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