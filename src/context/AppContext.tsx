import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { Medication, DoseLog, WaterLog, WaterSettings, AppSettings, ActiveAlarm } from '../types';
import { playWaterDropSound, playPillReminderSound, playCelebrationSound, triggerVibration } from '../services/soundService';
import { 
  sendLocalNotification, 
  getNotificationPermission, 
  initializeLocalNotifications, 
  syncNativeBackgroundAlarms 
} from '../services/notificationService';

const STORAGE_KEY_MEDS = 'vitaremind_medications_v1';
const STORAGE_KEY_DOSE_LOGS = 'vitaremind_dose_logs_v1';
const STORAGE_KEY_WATER_LOGS = 'vitaremind_water_logs_v1';
const STORAGE_KEY_WATER_SETTINGS = 'vitaremind_water_settings_v1';
const STORAGE_KEY_APP_SETTINGS = 'vitaremind_app_settings_v1';

const defaultWaterSettings: WaterSettings = {
  dailyGoalMl: 2500,
  reminderEnabled: true,
  intervalMinutes: 60,
  startTime: '08:30',
  endTime: '23:00',
  soundTone: 'drop',
  quickAmounts: [150, 200, 250, 330, 500],
};

const defaultAppSettings: AppSettings = {
  userName: 'Kullanıcı',
  notificationsEnabled: true,
  soundEnabled: true,
  soundVolume: 80,
  vibrationEnabled: true,
  reminderTone: 'gentle',
  themeMode: 'system',
};

const sampleMedications: Medication[] = [
  {
    id: 'med_sample_1',
    name: 'Omega 3 Balık Yağı',
    dosage: '1 Kapsül',
    form: 'capsule',
    color: 'amber',
    times: ['09:00'],
    instructions: 'with_meal',
    stockEnabled: true,
    stockCount: 28,
    stockAlertThreshold: 5,
    notes: 'Kahvaltıdan hemen sonra 1 bardak ılık su ile',
    active: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'med_sample_2',
    name: 'B12 & D3 Vitamini',
    dosage: '1 Tablet',
    form: 'tablet',
    color: 'emerald',
    times: ['13:00'],
    instructions: 'after_meal',
    stockEnabled: true,
    stockCount: 14,
    stockAlertThreshold: 5,
    notes: 'Öğle yemeği sonrası',
    active: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'med_sample_3',
    name: 'Magnezyum Sitrat',
    dosage: '1 Tablet',
    form: 'tablet',
    color: 'violet',
    times: ['21:30'],
    instructions: 'before_meal',
    stockEnabled: true,
    stockCount: 8,
    stockAlertThreshold: 5,
    notes: 'Yatmadan 1 saat önce, rahat uyku için',
    active: true,
    createdAt: new Date().toISOString(),
  },
];

function getTodayString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

interface AppContextType {
  medications: Medication[];
  doseLogs: DoseLog[];
  waterLogs: WaterLog[];
  waterSettings: WaterSettings;
  appSettings: AppSettings;
  activeAlarm: ActiveAlarm | null;
  todayWaterTotal: number;
  todayWaterPercentage: number;
  todayPillsDue: { med: Medication; time: string; log?: DoseLog }[];
  setActiveAlarm: (alarm: ActiveAlarm | null) => void;
  addMedication: (med: Omit<Medication, 'id' | 'createdAt'>) => void;
  updateMedication: (id: string, med: Partial<Medication>) => void;
  deleteMedication: (id: string) => void;
  toggleMedicationActive: (id: string) => void;
  refillStock: (id: string, count: number) => void;
  recordDose: (medId: string, scheduledTime: string, status: 'taken' | 'skipped' | 'snoozed', snoozeMinutes?: number, note?: string) => void;
  undoDose: (medId: string, scheduledTime: string) => void;
  addWater: (amountMl: number) => void;
  removeWaterLog: (logId: string) => void;
  updateWaterSettings: (settings: Partial<WaterSettings>) => void;
  updateAppSettings: (settings: Partial<AppSettings>) => void;
  testAlarm: (type: 'medication' | 'water') => void;
  snoozeCurrentAlarm: (minutes: number) => void;
  dismissCurrentAlarm: () => void;
  exportData: () => void;
  importData: (jsonStr: string) => boolean;
  resetAllData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [medications, setMedications] = useState<Medication[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_MEDS);
      return stored ? JSON.parse(stored) : sampleMedications;
    } catch {
      return sampleMedications;
    }
  });

  const [doseLogs, setDoseLogs] = useState<DoseLog[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_DOSE_LOGS);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [waterLogs, setWaterLogs] = useState<WaterLog[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_WATER_LOGS);
      if (stored) return JSON.parse(stored);
      // Sample today logs:
      const today = getTodayString();
      return [
        { id: 'w1', amountMl: 250, timestamp: new Date(Date.now() - 3 * 3600000).toISOString(), date: today },
        { id: 'w2', amountMl: 330, timestamp: new Date(Date.now() - 1 * 3600000).toISOString(), date: today },
      ];
    } catch {
      return [];
    }
  });

  const [waterSettings, setWaterSettings] = useState<WaterSettings>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_WATER_SETTINGS);
      return stored ? { ...defaultWaterSettings, ...JSON.parse(stored) } : defaultWaterSettings;
    } catch {
      return defaultWaterSettings;
    }
  });

  const [appSettings, setAppSettings] = useState<AppSettings>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_APP_SETTINGS);
      return stored ? { ...defaultAppSettings, ...JSON.parse(stored) } : defaultAppSettings;
    } catch {
      return defaultAppSettings;
    }
  });

  const [activeAlarm, setActiveAlarm] = useState<ActiveAlarm | null>(null);
  const lastAlarmTriggerTimeRef = useRef<{ [key: string]: number }>({});
  const lastWaterReminderTimeRef = useRef<number>(Date.now());

  // Save to localStorage whenever state updates
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_MEDS, JSON.stringify(medications));
  }, [medications]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_DOSE_LOGS, JSON.stringify(doseLogs));
  }, [doseLogs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_WATER_LOGS, JSON.stringify(waterLogs));
  }, [waterLogs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_WATER_SETTINGS, JSON.stringify(waterSettings));
  }, [waterSettings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_APP_SETTINGS, JSON.stringify(appSettings));
  }, [appSettings]);

  // Theme mode effect (Dark / Light / System)
  useEffect(() => {
    const themeMode = appSettings.themeMode || 'system';
    const applyTheme = () => {
      const isDark =
        themeMode === 'dark' ||
        (themeMode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    applyTheme();

    if (themeMode === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = (e: MediaQueryListEvent) => {
        if (e.matches) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      };
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, [appSettings.themeMode]);

  // Arka plan Android alarmlarını başlat ve senkronize et
  useEffect(() => {
    initializeLocalNotifications();
  }, []);

  useEffect(() => {
    syncNativeBackgroundAlarms(medications, waterSettings, appSettings.notificationsEnabled);
  }, [medications, waterSettings, appSettings.notificationsEnabled]);

  // Today calculations
  const todayStr = getTodayString();
  const todayWaterLogs = waterLogs.filter((w) => w.date === todayStr);
  const todayWaterTotal = todayWaterLogs.reduce((sum, item) => sum + item.amountMl, 0);
  const todayWaterPercentage = Math.min(100, Math.round((todayWaterTotal / (waterSettings.dailyGoalMl || 2500)) * 100));

  // Today's scheduled medication doses
  const todayDayOfWeek = new Date().getDay(); // 0 is Sunday, 1 is Monday
  const activeMedications = medications.filter((m) => m.active);

  const todayPillsDue = activeMedications.flatMap((med) => {
    // Check day of week filter
    if (med.daysOfWeek && med.daysOfWeek.length > 0 && !med.daysOfWeek.includes(todayDayOfWeek)) {
      return [];
    }
    return (med.times || []).map((time) => {
      const log = doseLogs.find((l) => l.medId === med.id && l.date === todayStr && l.scheduledTime === time);
      return { med, time, log };
    });
  }).sort((a, b) => a.time.localeCompare(b.time));

  // Alarm & Reminder Engine: Runs every 12 seconds to check pill schedules and water intervals
  useEffect(() => {
    const checkSchedule = () => {
      const now = new Date();
      const currentHours = String(now.getHours()).padStart(2, '0');
      const currentMinutes = String(now.getMinutes()).padStart(2, '0');
      const currentTimeStr = `${currentHours}:${currentMinutes}`;
      const nowEpoch = now.getTime();

      // 1. Check medication times
      for (const item of todayPillsDue) {
        const { med, time, log } = item;
        const key = `med_${med.id}_${todayStr}_${time}`;

        // If already taken or skipped, don't alarm
        if (log && (log.status === 'taken' || log.status === 'skipped')) {
          continue;
        }

        // If snoozed, check if snooze time has passed
        let isDue = false;
        if (log && log.status === 'snoozed' && log.snoozeUntil) {
          const snoozeEpoch = new Date(log.snoozeUntil).getTime();
          if (nowEpoch >= snoozeEpoch) {
            isDue = true;
          }
        } else if (currentTimeStr === time) {
          isDue = true;
        }

        if (isDue) {
          const lastTriggered = lastAlarmTriggerTimeRef.current[key] || 0;
          // Don't trigger more than once every 60 seconds for same pill dose
          if (nowEpoch - lastTriggered > 60000) {
            lastAlarmTriggerTimeRef.current[key] = nowEpoch;

            // Trigger alert!
            triggerAlarm({
              id: `alarm_${med.id}_${Date.now()}`,
              type: 'medication',
              title: `💊 İlaç Vakti: ${med.name}`,
              description: `${med.dosage} (${formatInstructions(med.instructions)}) almanız gerekiyor.`,
              medication: med,
              scheduledTime: time,
              timestamp: new Date().toISOString(),
            });
            break;
          }
        }
      }

      // 2. Check water reminders
      if (waterSettings.reminderEnabled) {
        const [startH, startM] = waterSettings.startTime.split(':').map(Number);
        const [endH, endM] = waterSettings.endTime.split(':').map(Number);
        const curMinutesOfDay = now.getHours() * 60 + now.getMinutes();
        const startMinutesOfDay = startH * 60 + (startM || 0);
        const endMinutesOfDay = endH * 60 + (endM || 0);

        if (curMinutesOfDay >= startMinutesOfDay && curMinutesOfDay <= endMinutesOfDay) {
          // Check last drink time
          let lastDrinkEpoch = lastWaterReminderTimeRef.current;
          if (todayWaterLogs.length > 0) {
            const sortedLogs = [...todayWaterLogs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
            const mostRecentLogEpoch = new Date(sortedLogs[0].timestamp).getTime();
            if (mostRecentLogEpoch > lastDrinkEpoch) {
              lastDrinkEpoch = mostRecentLogEpoch;
              lastWaterReminderTimeRef.current = mostRecentLogEpoch;
            }
          }

          const intervalMs = waterSettings.intervalMinutes * 60 * 1000;
          if (nowEpoch - lastDrinkEpoch >= intervalMs) {
            const lastAlarmTime = lastAlarmTriggerTimeRef.current['water_reminder'] || 0;
            if (nowEpoch - lastAlarmTime > intervalMs) {
              lastAlarmTriggerTimeRef.current['water_reminder'] = nowEpoch;
              lastWaterReminderTimeRef.current = nowEpoch;

              triggerAlarm({
                id: `water_alarm_${Date.now()}`,
                type: 'water',
                title: '💧 Su İçme Vakti!',
                description: `Vücudunuzu hidrate tutma zamanı. Günlük hedefiniz: ${todayWaterTotal} / ${waterSettings.dailyGoalMl} ml.`,
                timestamp: new Date().toISOString(),
              });
            }
          }
        }
      }
    };

    const interval = setInterval(checkSchedule, 12000);
    return () => clearInterval(interval);
  }, [todayPillsDue, waterSettings, todayWaterLogs, todayWaterTotal, todayStr]);

  const triggerAlarm = (alarm: ActiveAlarm) => {
    setActiveAlarm(alarm);

    // Audio & Haptic
    if (appSettings.soundEnabled) {
      if (alarm.type === 'water') {
        playWaterDropSound(appSettings.soundVolume);
      } else {
        playPillReminderSound(appSettings.soundVolume, appSettings.reminderTone);
      }
    }
    if (appSettings.vibrationEnabled) {
      triggerVibration([200, 100, 200, 100, 300]);
    }

    // System Notification
    if (appSettings.notificationsEnabled) {
      sendLocalNotification(alarm.title, {
        body: alarm.description,
        tag: alarm.id,
      });
    }
  };

  const addMedication = (medData: Omit<Medication, 'id' | 'createdAt'>) => {
    const newMed: Medication = {
      ...medData,
      id: `med_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
    };
    setMedications((prev) => [newMed, ...prev]);
  };

  const updateMedication = (id: string, updatedFields: Partial<Medication>) => {
    setMedications((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...updatedFields } : m))
    );
  };

  const deleteMedication = (id: string) => {
    setMedications((prev) => prev.filter((m) => m.id !== id));
    // Clean associated logs
    setDoseLogs((prev) => prev.filter((l) => l.medId !== id));
  };

  const toggleMedicationActive = (id: string) => {
    setMedications((prev) =>
      prev.map((m) => (m.id === id ? { ...m, active: !m.active } : m))
    );
  };

  const refillStock = (id: string, count: number) => {
    setMedications((prev) =>
      prev.map((m) => (m.id === id ? { ...m, stockCount: Math.max(0, m.stockCount + count) } : m))
    );
  };

  const recordDose = (
    medId: string,
    scheduledTime: string,
    status: 'taken' | 'skipped' | 'snoozed',
    snoozeMinutes: number = 15,
    note?: string
  ) => {
    const now = new Date();
    const today = getTodayString();
    let snoozeUntil: string | undefined;

    if (status === 'snoozed') {
      const snoozeTime = new Date(now.getTime() + snoozeMinutes * 60000);
      snoozeUntil = snoozeTime.toISOString();
    }

    setDoseLogs((prev) => {
      // Check if existing log for this med, date, and scheduledTime exists
      const existingIdx = prev.findIndex(
        (l) => l.medId === medId && l.date === today && l.scheduledTime === scheduledTime
      );

      const newLog: DoseLog = {
        id: existingIdx >= 0 ? prev[existingIdx].id : `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        medId,
        scheduledTime,
        date: today,
        status,
        actualTime: now.toISOString(),
        snoozeUntil,
        notes: note,
      };

      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = newLog;
        return updated;
      }
      return [...prev, newLog];
    });

    // If taken, decrement stock if stockEnabled
    if (status === 'taken') {
      setMedications((prev) =>
        prev.map((m) => {
          if (m.id === medId && m.stockEnabled && m.stockCount > 0) {
            return { ...m, stockCount: m.stockCount - 1 };
          }
          return m;
        })
      );
      if (appSettings.soundEnabled) {
        playCelebrationSound(appSettings.soundVolume);
      }
      if (appSettings.vibrationEnabled) {
        triggerVibration([80, 50, 80]);
      }
    }

    // Dismiss active alarm if it corresponds to this med
    if (activeAlarm && activeAlarm.medication?.id === medId) {
      setActiveAlarm(null);
    }
  };

  const undoDose = (medId: string, scheduledTime: string) => {
    const today = getTodayString();
    const existing = doseLogs.find(
      (l) => l.medId === medId && l.date === today && l.scheduledTime === scheduledTime
    );
    if (!existing) return;

    // If it was taken, restore 1 stock count
    if (existing.status === 'taken') {
      setMedications((prev) =>
        prev.map((m) => (m.id === medId && m.stockEnabled ? { ...m, stockCount: m.stockCount + 1 } : m))
      );
    }

    setDoseLogs((prev) => prev.filter((l) => l.id !== existing.id));
  };

  const addWater = (amountMl: number) => {
    const today = getTodayString();
    const newLog: WaterLog = {
      id: `wlog_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      amountMl,
      timestamp: new Date().toISOString(),
      date: today,
    };
    setWaterLogs((prev) => [...prev, newLog]);
    lastWaterReminderTimeRef.current = Date.now();

    if (appSettings.soundEnabled) {
      playWaterDropSound(appSettings.soundVolume);
    }
    if (appSettings.vibrationEnabled) {
      triggerVibration([50]);
    }

    // Dismiss active water alarm
    if (activeAlarm && activeAlarm.type === 'water') {
      setActiveAlarm(null);
    }
  };

  const removeWaterLog = (logId: string) => {
    setWaterLogs((prev) => prev.filter((l) => l.id !== logId));
  };

  const updateWaterSettings = (settings: Partial<WaterSettings>) => {
    setWaterSettings((prev) => ({ ...prev, ...settings }));
  };

  const updateAppSettings = (settings: Partial<AppSettings>) => {
    setAppSettings((prev) => ({ ...prev, ...settings }));
  };

  const testAlarm = (type: 'medication' | 'water') => {
    if (type === 'water') {
      triggerAlarm({
        id: `test_water_${Date.now()}`,
        type: 'water',
        title: '💧 Test Su Hatırlatıcısı',
        description: 'Vücudunuzu zinde tutmak için bir bardak su için!',
        timestamp: new Date().toISOString(),
      });
    } else {
      const sampleMed = medications[0] || sampleMedications[0];
      triggerAlarm({
        id: `test_med_${Date.now()}`,
        type: 'medication',
        title: `💊 Test İlaç Hatırlatıcısı: ${sampleMed.name}`,
        description: `${sampleMed.dosage} - ${formatInstructions(sampleMed.instructions)} alınız.`,
        medication: sampleMed,
        scheduledTime: '12:00',
        timestamp: new Date().toISOString(),
      });
    }
  };

  const snoozeCurrentAlarm = (minutes: number) => {
    if (!activeAlarm) return;
    if (activeAlarm.type === 'medication' && activeAlarm.medication && activeAlarm.scheduledTime) {
      recordDose(activeAlarm.medication.id, activeAlarm.scheduledTime, 'snoozed', minutes);
    }
    setActiveAlarm(null);
  };

  const dismissCurrentAlarm = () => {
    setActiveAlarm(null);
  };

  const exportData = () => {
    const backupData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      medications,
      doseLogs,
      waterLogs,
      waterSettings,
      appSettings,
    };
    const jsonStr = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vitaremind-yedek-${getTodayString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importData = (jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.medications && Array.isArray(parsed.medications)) {
        setMedications(parsed.medications);
      }
      if (parsed.doseLogs && Array.isArray(parsed.doseLogs)) {
        setDoseLogs(parsed.doseLogs);
      }
      if (parsed.waterLogs && Array.isArray(parsed.waterLogs)) {
        setWaterLogs(parsed.waterLogs);
      }
      if (parsed.waterSettings) {
        setWaterSettings((prev) => ({ ...prev, ...parsed.waterSettings }));
      }
      if (parsed.appSettings) {
        setAppSettings((prev) => ({ ...prev, ...parsed.appSettings }));
      }
      return true;
    } catch (e) {
      console.error('Import error:', e);
      return false;
    }
  };

  const resetAllData = () => {
    setMedications(sampleMedications);
    setDoseLogs([]);
    setWaterLogs([]);
    setWaterSettings(defaultWaterSettings);
    setAppSettings(defaultAppSettings);
    localStorage.clear();
  };

  return (
    <AppContext.Provider
      value={{
        medications,
        doseLogs,
        waterLogs,
        waterSettings,
        appSettings,
        activeAlarm,
        todayWaterTotal,
        todayWaterPercentage,
        todayPillsDue,
        setActiveAlarm,
        addMedication,
        updateMedication,
        deleteMedication,
        toggleMedicationActive,
        refillStock,
        recordDose,
        undoDose,
        addWater,
        removeWaterLog,
        updateWaterSettings,
        updateAppSettings,
        testAlarm,
        snoozeCurrentAlarm,
        dismissCurrentAlarm,
        exportData,
        importData,
        resetAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useApp(): AppContextType {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

export function formatInstructions(inst: string): string {
  switch (inst) {
    case 'before_meal':
      return 'Aç karnına';
    case 'after_meal':
      return 'Tok karnına';
    case 'with_meal':
      return 'Yemekle birlikte';
    case 'anytime':
    default:
      return 'Fark etmez';
  }
}
