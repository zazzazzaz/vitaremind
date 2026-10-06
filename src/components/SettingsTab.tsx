import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Bell, 
  Volume2, 
  Vibrate, 
  ShieldCheck, 
  Download, 
  Upload, 
  RotateCcw, 
  Check, 
  Sparkles, 
  Play, 
  User, 
  Info,
  CheckCircle2,
  Sun,
  Moon,
  Monitor
} from 'lucide-react';
import { LocalNotifications } from '@capacitor/local-notifications';
import { requestNotificationPermission, getNotificationPermission } from '../services/notificationService';
import { playPillReminderSound, playWaterDropSound, triggerVibration } from '../services/soundService';

export const SettingsTab: React.FC = () => {
  const {
    appSettings,
    updateAppSettings,
    testAlarm,
    exportData,
    importData,
    resetAllData,
  } = useApp();

  const [notificationStatus, setNotificationStatus] = useState<string>('default');
  const [importSuccessMsg, setImportSuccessMsg] = useState('');
  const [importErrorMsg, setImportErrorMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function checkNativePerm() {
      try {
        const res = await LocalNotifications.checkPermissions();
        if (res.display === 'granted') {
          setNotificationStatus('granted');
          return;
        } else if (res.display === 'denied') {
          setNotificationStatus('denied');
          return;
        }
      } catch {
        // fallback
      }
      setNotificationStatus(getNotificationPermission());
    }
    checkNativePerm();
  }, []);

  const handleRequestPermission = async () => {
    try {
      const res = await LocalNotifications.requestPermissions();
      if (res.display === 'granted') {
        setNotificationStatus('granted');
        updateAppSettings({ notificationsEnabled: true });
        alert('✓ Bildirim izni başarıyla aktif edildi!');
        return;
      } else {
        setNotificationStatus(res.display === 'denied' ? 'denied' : 'prompt');
        alert(
          '⚠️ Android sistem izin diyaloğu açılamadı veya engellendi.\n\nLütfen telefonunuzun Ayarlar > Uygulamalar > VitaRemind > Bildirimler bölümünden izin verildiğinden emin olun.'
        );
      }
    } catch {
      // fallback
    }

    const webRes = await requestNotificationPermission();
    setNotificationStatus(webRes);
    if (webRes === 'granted') {
      updateAppSettings({ notificationsEnabled: true });
      alert('✓ Bildirim izni aktif edildi!');
    } else {
      alert(
        '⚠️ Cihaz bildirim izni verilmedi. Lütfen telefonunuzun ayarlarından VitaRemind bildirimlerini aktifleştirin.'
      );
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = importData(content);
        if (success) {
          setImportSuccessMsg('Yedek başarıyla yüklendi!');
          setImportErrorMsg('');
          setTimeout(() => setImportSuccessMsg(''), 4000);
        } else {
          setImportErrorMsg('Dosya formatı geçersiz veya bozuk.');
          setImportSuccessMsg('');
        }
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const testCurrentTone = () => {
    playPillReminderSound(appSettings.soundVolume, appSettings.reminderTone);
    if (appSettings.vibrationEnabled) {
      triggerVibration([100, 50, 100]);
    }
  };

  return (
    <div className="space-y-6 pb-24 max-w-4xl mx-auto px-4 pt-4">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Ayarlar & Kişiselleştirme</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Uygulama seslerini, görünüm temasını, bildirim izinlerini ve kişisel verilerinizi özelleştirin
        </p>
      </div>

      {/* Privacy & Security Feature Card */}
      <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/20">
            <ShieldCheck className="w-6 h-6 text-emerald-300" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
              <span>Gizlilik & Yerel Veri Güvenliği</span>
            </h3>
            <p className="text-xs text-teal-100/90 leading-relaxed">
              Bütün ilaç takviminiz ve su takip verileriniz yalnızca kendi cihazınızda güvenle saklanır.
            </p>
          </div>
        </div>
      </div>

      {/* User Name / Profile */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
          <User className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          <span>Kişisel Bilgiler</span>
        </h3>
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">İsminiz / Kullanıcı Adı</label>
          <input
            type="text"
            value={appSettings.userName}
            onChange={(e) => updateAppSettings({ userName: e.target.value })}
            placeholder="Örn: Ahmet Yılmaz"
            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:text-white rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>

      {/* Theme Settings (Açık / Koyu / Sistem Teması) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4 transition-colors">
        <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
          <Moon className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          <span>Görünüm & Tema Tercihi</span>
        </h3>

        <div className="grid grid-cols-3 gap-2 pt-1">
          {[
            { id: 'system', label: 'Sistem Teması', icon: Monitor },
            { id: 'light', label: 'Açık Tema', icon: Sun },
            { id: 'dark', label: 'Koyu Tema', icon: Moon },
          ].map((t) => {
            const Icon = t.icon;
            const isActive = (appSettings.themeMode || 'system') === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => updateAppSettings({ themeMode: t.id as any })}
                className={`py-3 px-3 rounded-2xl border text-xs font-bold transition flex flex-col items-center justify-center gap-1.5 ${
                  isActive
                    ? 'bg-teal-50 dark:bg-teal-950/40 border-teal-500 text-teal-800 dark:text-teal-300 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Notifications & Sound Settings */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5">
        <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
          <Bell className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          <span>Bildirimler & Ses Efektleri</span>
        </h3>

        {/* Master Notification Switch */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-slate-900 dark:text-white block">Tüm Arka Plan Alarmları ve Bildirimler</span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              İlaç vakti geldiğinde telefon kilitliyken bile sesli bildirim uyarısı gönderir.
            </p>
          </div>
          <input
            type="checkbox"
            checked={appSettings.notificationsEnabled}
            onChange={(e) => {
              const val = e.target.checked;
              updateAppSettings({ notificationsEnabled: val });
              if (val) {
                handleRequestPermission();
              }
            }}
            className="w-5 h-5 text-teal-600 rounded-md border-slate-300 focus:ring-teal-500 cursor-pointer"
          />
        </div>

        {/* Device Notification Status Card */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Cihaz İzin Durumu:</span>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  notificationStatus === 'granted'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                    : notificationStatus === 'denied'
                    ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                }`}
              >
                {notificationStatus === 'granted'
                  ? 'Aktif (İzin Verildi)'
                  : notificationStatus === 'denied'
                  ? 'Engellendi'
                  : 'İzin Bekleniyor'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {notificationStatus === 'granted'
                ? 'Sistem izinleri verildi. Alarmlarınız tam vaktinde çalacaktır.'
                : 'Bildirim almıyorsanız telefonunuzun Ayarlar > Uygulamalar > VitaRemind > Bildirimler sekmesinden izin verin.'}
            </p>
          </div>

          <button
            onClick={handleRequestPermission}
            className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition shrink-0"
          >
            {notificationStatus === 'granted' ? 'İzni Yeniden Kontrol Et' : 'İzin İste / Aç'}
          </button>
        </div>

        {/* Sound toggle & tone selection */}
        <div className="space-y-4 pt-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Hatırlatma Sesi Çalsın</span>
            </div>
            <input
              type="checkbox"
              checked={appSettings.soundEnabled}
              onChange={(e) => updateAppSettings({ soundEnabled: e.target.checked })}
              className="w-5 h-5 text-teal-600 rounded-md border-slate-300 focus:ring-teal-500 cursor-pointer"
            />
          </div>

          {appSettings.soundEnabled && (
            <>
              {/* Tone selection */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Alarm Melodisi
                  </label>
                  <button
                    type="button"
                    onClick={testCurrentTone}
                    className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:text-teal-800 flex items-center gap-1"
                  >
                    <Play className="w-3 h-3 fill-teal-600 dark:fill-teal-400" />
                    <span>Tonu Dinle</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'gentle', label: 'Nazik Melodi' },
                    { id: 'chime', label: 'Harmonik Çan' },
                    { id: 'digital', label: 'Modern Bip' },
                    { id: 'zen', label: 'Zen / Huzur' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => updateAppSettings({ reminderTone: t.id as any })}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition ${
                        appSettings.reminderTone === t.id
                          ? 'bg-teal-50 dark:bg-teal-950/40 border-teal-500 text-teal-800 dark:text-teal-300'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Volume Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span>Ses Seviyesi</span>
                  <span className="text-teal-600 dark:text-teal-400">%{appSettings.soundVolume}</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={appSettings.soundVolume}
                  onChange={(e) => updateAppSettings({ soundVolume: Number(e.target.value) })}
                  className="w-full accent-teal-600 cursor-pointer"
                />
              </div>
            </>
          )}

          {/* Vibration toggle */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Vibrate className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Titreşim Efekti</span>
            </div>
            <input
              type="checkbox"
              checked={appSettings.vibrationEnabled}
              onChange={(e) => updateAppSettings({ vibrationEnabled: e.target.checked })}
              className="w-5 h-5 text-teal-600 rounded-md border-slate-300 focus:ring-teal-500 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* AI Settings */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            <span>Yapay Zeka (Gemini Vision) Ayarları</span>
          </h3>
          <span className="text-[11px] font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/40 px-2.5 py-1 rounded-full border border-teal-100 dark:border-teal-900">
            Akıllı Tarama
          </span>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          İlaç kutularını ve reçeteleri kameranızla tarayıp otomatik ilaç eklemek için Google Gemini API anahtarınızı tanımlayabilirsiniz.
        </p>

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Gemini API Key</label>
          <div className="flex gap-2">
            <input
              type="password"
              placeholder="AIzaSy..."
              defaultValue={typeof window !== 'undefined' ? localStorage.getItem('vitaremind_gemini_api_key') || '' : ''}
              id="gemini-api-input"
              className="flex-1 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:text-white rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <button
              onClick={() => {
                const el = document.getElementById('gemini-api-input') as HTMLInputElement;
                if (el) {
                  const cleaned = el.value
                    .trim()
                    .replace(/[\u201C\u201D\u2018\u2019"]/g, '')
                    .replace(/[^\x20-\x7E]/g, '');
                  localStorage.setItem('vitaremind_gemini_api_key', cleaned);
                  el.value = cleaned;
                  alert('Gemini API Anahtarı temizlenip başarıyla kaydedildi!');
                }
              }}
              className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
            >
              Kaydet
            </button>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500">
            Anahtarınız yalnızca cihazınızın yerel hafızasında güvenle saklanır.
          </p>
        </div>

        {/* Custom Model ID Configuration for Future Proofing */}
        <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800 mt-4">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Gemini Model Adı (Gelişmiş)</label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="gemini-3.8-flash"
              defaultValue={typeof window !== 'undefined' ? localStorage.getItem('vitaremind_gemini_model') || 'gemini-3.8-flash' : 'gemini-3.8-flash'}
              id="gemini-model-input"
              className="flex-1 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:text-white rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <button
              onClick={() => {
                const el = document.getElementById('gemini-model-input') as HTMLInputElement;
                if (el) {
                  localStorage.setItem('vitaremind_gemini_model', el.value.trim() || 'gemini-3.8-flash');
                  alert('Gemini Model adı başarıyla kaydedildi!');
                }
              }}
              className="px-4 py-2.5 bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow-xs transition"
            >
              Modeli Kaydet
            </button>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500">
            Google yeni bir model çıkardığında burayı dilediğiniz zaman güncelleyebilirsiniz. Ayrıca uygulama otomatik yedek model zincirine de sahiptir.
          </p>
        </div>
      </div>

      {/* Data Backup & Restore */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-900 dark:text-white text-base">Veri Yedekleme & Geri Yükleme</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          İlaçlarınızı, içtiğiniz suları ve kişisel saatlerinizi yedekleyebilir veya başka bir telefona aktarabilirsiniz.
        </p>

        {importSuccessMsg && (
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{importSuccessMsg}</span>
          </div>
        )}

        {importErrorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs font-bold flex items-center gap-2">
            <span>{importErrorMsg}</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".json"
            className="hidden"
          />
          <button
            onClick={() => exportData()}
            className="flex-1 py-3 px-4 rounded-xl bg-teal-50 dark:bg-teal-950/40 hover:bg-teal-100 text-teal-800 dark:text-teal-300 font-bold text-xs flex items-center justify-center gap-2 border border-teal-200 dark:border-teal-800 transition"
          >
            <Download className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span>Yedek İndir (JSON)</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 py-3 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700 transition"
          >
            <Upload className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            <span>Yedek Yükleme (JSON)</span>
          </button>
        </div>
      </div>

      {/* Reset Data */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-900 dark:text-white text-base text-rose-600 dark:text-rose-400">Tehlikeli Bölge</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Tüm ilaç kayıtlarınızı, geçmişinizi ve su verilerinizi kalibre edin veya sıfırlayın.
        </p>
        <button
          onClick={() => resetAllData()}
          className="py-3 px-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-700 dark:text-rose-300 font-bold text-xs flex items-center justify-center gap-2 border border-rose-200 dark:border-rose-800 transition w-full"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Tüm Verileri Sıfırla</span>
        </button>
      </div>

      {/* Version Info (Readable Dark/Light Gray) */}
      <div className="pt-6 pb-4 text-center border-t border-slate-200/60 dark:border-slate-800">
        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wider">
          VitaRemind v1.0.0
        </p>
        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">
          Kişiselleştirilmiş İlaç & Su Hatırlatıcı
        </p>
      </div>
    </div>
  );
};
