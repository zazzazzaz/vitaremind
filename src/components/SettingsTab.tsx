import React, { useState, useRef } from 'react';
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
  Smartphone, 
  Sparkles, 
  Play, 
  User, 
  Info,
  CheckCircle2,
  Sun,
  Moon,
  Laptop,
  Key
} from 'lucide-react';
import { requestNotificationPermission, getNotificationPermission } from '../services/notificationService';
import { playPillReminderSound, playWaterDropSound, triggerVibration } from '../services/soundService';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const SettingsTab: React.FC = () => {
  const {
    appSettings,
    updateAppSettings,
    exportData,
    importData,
    resetAllData,
  } = useApp();

  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(getNotificationPermission());
  const [permissionRequested, setPermissionRequested] = useState(false);
  const [importSuccessMsg, setImportSuccessMsg] = useState('');
  const [importErrorMsg, setImportErrorMsg] = useState('');
  const [showGuideModal, setShowGuideModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleRequestPermission = async () => {
    setPermissionRequested(true);
    const perm = await requestNotificationPermission();
    setNotificationPermission(perm);
    if (perm === 'granted') {
      updateAppSettings({ notificationsEnabled: true });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const ok = importData(text);
        if (ok) {
          setImportSuccessMsg('Verileriniz başarıyla geri yüklendi!');
          setImportErrorMsg('');
          setTimeout(() => setImportSuccessMsg(''), 4000);
        } else {
          setImportErrorMsg('Geçersiz yedek dosyası formatı.');
        }
      } catch {
        setImportErrorMsg('Dosya okunurken bir hata oluştu.');
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
          Uygulama seslerini, yapay zeka anahtarınızı ve kişisel tercihlerinizi özelleştirin
        </p>
      </div>

      {/* User Name / Profile */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
          <User className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          <span>Kişisel Bilgiler</span>
        </h3>
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Size Nasıl Hitap Edelim?
          </label>
          <input
            type="text"
            value={appSettings.userName}
            onChange={(e) => updateAppSettings({ userName: e.target.value })}
            placeholder="Adınız"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white font-bold text-sm focus:border-teal-500 outline-hidden"
          />
        </div>
      </div>

      {/* Gemini API Key Setting Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
            <Key className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span>Google Gemini API Anahtarı</span>
          </h3>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
            Kişisel
          </span>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          İlaç kutusunu fotoğraflayarak otomatik tanıma özelliğini kullanmak için kendi ücretsiz Gemini API anahtarınızı girebilirsiniz. Anahtarınız sadece bu cihazın hafızasında saklanır.
        </p>

        <div className="space-y-1.5 pt-1">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            API Anahtarı (AIzaSy...)
          </label>
          <input
            type="password"
            value={appSettings.geminiApiKey || ''}
            onChange={(e) => updateAppSettings({ geminiApiKey: e.target.value.trim() })}
            placeholder="AIzaSy..."
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white font-mono text-xs focus:border-teal-500 outline-hidden"
          />
        </div>

        <div className="flex items-center justify-between pt-1">
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-teal-600 dark:text-teal-400 font-bold hover:underline inline-flex items-center gap-1"
          >
            <span>Ücretsiz Google API Anahtarı Al</span>
            <span>↗</span>
          </a>
          {appSettings.geminiApiKey && (
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              <span>Anahtar Kaydedildi</span>
            </span>
          )}
        </div>
      </div>

      {/* Theme Selection Card (Light / Dark / System) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
            <Sun className="w-4 h-4 text-amber-500 dark:hidden" />
            <Moon className="w-4 h-4 text-teal-400 hidden dark:inline" />
            <span>Görünüm & Tema</span>
          </h3>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            {appSettings.theme === 'dark' ? 'Koyu Tema' : appSettings.theme === 'light' ? 'Açık Tema' : 'Sistemle Uyumlu'}
          </span>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          Uygulamanın açık veya koyu modda çalışmasını seçebilir ya da cihazınızın temasına göre otomatik ayarlayabilirsiniz.
        </p>

        <div className="grid grid-cols-3 gap-2.5 pt-1">
          <button
            type="button"
            onClick={() => updateAppSettings({ theme: 'light' })}
            className={`flex flex-col items-center justify-center gap-2 p-3.5 rounded-2xl border text-xs font-bold transition ${
              appSettings.theme === 'light'
                ? 'bg-amber-50/70 border-amber-500 text-amber-900 shadow-xs'
                : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60'
            }`}
          >
            <div className={`p-2 rounded-xl ${appSettings.theme === 'light' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
              <Sun className="w-5 h-5" />
            </div>
            <span>Açık Tema</span>
          </button>

          <button
            type="button"
            onClick={() => updateAppSettings({ theme: 'dark' })}
            className={`flex flex-col items-center justify-center gap-2 p-3.5 rounded-2xl border text-xs font-bold transition ${
              appSettings.theme === 'dark'
                ? 'bg-teal-950/60 border-teal-500 text-teal-300 shadow-xs'
                : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60'
            }`}
          >
            <div className={`p-2 rounded-xl ${appSettings.theme === 'dark' ? 'bg-teal-900/60 text-teal-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
              <Moon className="w-5 h-5" />
            </div>
            <span>Koyu Tema</span>
          </button>

          <button
            type="button"
            onClick={() => updateAppSettings({ theme: 'system' || !appSettings.theme })}
            className={`flex flex-col items-center justify-center gap-2 p-3.5 rounded-2xl border text-xs font-bold transition ${
              (!appSettings.theme || appSettings.theme === 'system')
                ? 'bg-teal-50 dark:bg-slate-800 border-teal-500 text-teal-800 dark:text-teal-300 shadow-xs'
                : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60'
            }`}
          >
            <div className={`p-2 rounded-xl ${(!appSettings.theme || appSettings.theme === 'system') ? 'bg-teal-100 dark:bg-slate-700 text-teal-700 dark:text-teal-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
              <Laptop className="w-5 h-5" />
            </div>
            <span>Sistem</span>
          </button>
        </div>
      </div>

      {/* Notifications & Sound Settings */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5">
        <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
          <Bell className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          <span>Bildirimler & Ses Efektleri</span>
        </h3>

        {/* Browser Notification Status */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Cihaz Bildirim İzni:</span>
              <span
                className={`text-xs font-black uppercase px-2 py-0.5 rounded-full ${
                  notificationPermission === 'granted'
                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                    : notificationPermission === 'denied'
                    ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
                    : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                }`}
              >
                {notificationPermission === 'granted'
                  ? 'Verildi'
                  : notificationPermission === 'denied'
                  ? 'Engellendi'
                  : 'Bekliyor'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Telefon ekranı kilitliyken veya uygulama arkadayken alarm almak için bildirim izni gereklidir.
            </p>
          </div>

          {notificationPermission !== 'granted' && (
            <button
              onClick={handleRequestPermission}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shrink-0 transition"
            >
              {permissionRequested ? 'İzni Yenile' : 'İzin Ver'}
            </button>
          )}
        </div>

        {/* In-App Sounds Toggle */}
        <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-teal-50 dark:bg-slate-800 text-teal-600 dark:text-teal-400">
              <Volume2 className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                Sesli Uyarılar & Efektler
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                İlaç ve su saati geldiğinde sesli alarm çalar
              </span>
            </div>
          </div>
          <input
            type="checkbox"
            checked={appSettings.soundEnabled}
            onChange={(e) => updateAppSettings({ soundEnabled: e.target.checked })}
            className="w-5 h-5 text-teal-600 rounded-md border-slate-300 dark:border-slate-700 focus:ring-teal-500"
          />
        </div>

        {/* Volume Slider */}
        {appSettings.soundEnabled && (
          <div className="space-y-2 py-1">
            <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
              <span>Ses Seviyesi</span>
              <span>%{appSettings.soundVolume}</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={appSettings.soundVolume}
              onChange={(e) => updateAppSettings({ soundVolume: Number(e.target.value) })}
              className="w-full accent-teal-600 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
            />
          </div>
        )}

        {/* Reminder Tone Selection */}
        {appSettings.soundEnabled && (
          <div className="space-y-2 py-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
              Hatırlatıcı Alarm Melodisi
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'gentle', label: 'Yumuşak Melodi' },
                { id: 'chime', label: 'Kristal Çan' },
                { id: 'digital', label: 'Dijital Bip' },
                { id: 'zen', label: 'Zen Gong' },
              ].map((tone) => (
                <button
                  key={tone.id}
                  onClick={() => updateAppSettings({ reminderTone: tone.id as any })}
                  className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition ${
                    appSettings.reminderTone === tone.id
                      ? 'bg-teal-50 dark:bg-slate-800 border-teal-500 text-teal-800 dark:text-teal-300'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <span>{tone.label}</span>
                  {appSettings.reminderTone === tone.id && (
                    <Check className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                  )}
                </button>
              ))}
            </div>

            <button
              onClick={testCurrentTone}
              className="text-xs text-teal-600 dark:text-teal-400 font-bold hover:text-teal-700 flex items-center gap-1.5 pt-1"
            >
              <Play className="w-3.5 h-3.5 fill-teal-600 dark:fill-teal-400" />
              <span>Seçili Melodiyi Dinle</span>
            </button>
          </div>
        )}

        {/* Vibration Toggle */}
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-teal-50 dark:bg-slate-800 text-teal-600 dark:text-teal-400">
              <Vibrate className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                Titreşim
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Alarmlar sırasında cihazı titret (Destekleyen telefonlarda)
              </span>
            </div>
          </div>
          <input
            type="checkbox"
            checked={appSettings.vibrationEnabled}
            onChange={(e) => updateAppSettings({ vibrationEnabled: e.target.checked })}
            className="w-5 h-5 text-teal-600 rounded-md border-slate-300 dark:border-slate-700 focus:ring-teal-500"
          />
        </div>
      </div>

      {/* PWA Phone Installation Helper */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          <span>Telefona / Masaüstüne Yükleme (PWA)</span>
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          VitaRemind tarayıcıdan bağımsız, tam ekran ve internet olmadan da çalışabilen bir Progressive Web App (PWA) uygulamasıdır.
        </p>

        {isInstalled ? (
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>VitaRemind cihazınıza başarıyla yüklenmiş durumdadır.</span>
          </div>
        ) : (
          <div className="space-y-2">
            <button
              onClick={() => {
                if (isInstallable) {
                  install();
                } else {
                  setShowGuideModal(true);
                }
              }}
              className="w-full py-3.5 bg-teal-600 hover:bg-teal-700 active:scale-[0.99] text-white font-bold text-sm rounded-xl shadow-md shadow-teal-600/20 transition flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>{isInstallable ? 'Hemen Telefona Yükle' : 'Telefona Yükle / Nasıl Yüklenir?'}</span>
            </button>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center">
              Chrome menüsündeki üç nokta (⋮) butonundan da "Uygulamayı Yükle" diyebilirsiniz.
            </p>
          </div>
        )}
      </div>

      {/* Guide modal if opened from settings */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl text-slate-800 dark:text-slate-100 border dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Telefona Kolay Kurulum</h3>
              </div>
              <button
                onClick={() => setShowGuideModal(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
              <div className="p-3 bg-teal-50 dark:bg-slate-800 rounded-2xl border border-teal-100 dark:border-slate-700 space-y-1">
                <span className="font-bold text-teal-900 dark:text-teal-300 block text-xs">📱 Android (Chrome):</span>
                <p>1. Chrome'un sağ üst köşesindeki <strong>üç nokta (⋮)</strong> simgesine dokunun.</p>
                <p>2. Menüden <strong>"Uygulamayı Yükle"</strong> (veya "Ana Ekrana Ekle") butonuna dokunun.</p>
                <p>3. Karşınıza <strong>VitaRemind</strong> onay penceresi gelecektir.</p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="font-bold text-slate-900 dark:text-white block text-xs">🍎 iPhone (Safari):</span>
                <p>1. Safari'nin altındaki <strong>Paylaş</strong> simgesine dokunun.</p>
                <p>2. <strong>"Ana Ekrana Ekle"</strong> butonuna basın.</p>
              </div>
            </div>

            <button
              onClick={() => setShowGuideModal(false)}
              className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs transition"
            >
              Anladım
            </button>
          </div>
        </div>
      )}

      {/* Data Backup & Restore */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-900 dark:text-white text-base">Veri Yedekleme & Geri Yükleme</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          İlaçlarınızı, içtiğiniz suları ve kişisel saatlerinizi yedekleyebilir veya başka bir telefona aktarabilirsiniz.
        </p>

        {importSuccessMsg && (
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{importSuccessMsg}</span>
          </div>
        )}

        {importErrorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 text-xs font-bold">
            {importErrorMsg}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={exportData}
            className="py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition"
          >
            <Download className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span>Yedeği İndir (.json)</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition"
          >
            <Upload className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span>Yedekten Geri Yükle</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".json"
            className="hidden"
          />
        </div>

        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-500 dark:text-slate-400">Tüm verileri temizle:</span>
          <button
            onClick={() => {
              if (confirm('Tüm ilaç ve su kayıtlarınız silinerek varsayılan ayarlara dönülecek. Onaylıyor musunuz?')) {
                resetAllData();
              }
            }}
            className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:text-rose-800 flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Varsayılana Sıfırla</span>
          </button>
        </div>
      </div>

      {/* App Version & Credits Card */}
      <div className="text-center py-4 space-y-1 text-slate-400 dark:text-slate-500">
        <div className="flex items-center justify-center gap-2">
          <span className="font-extrabold text-xs text-slate-600 dark:text-slate-300">VitaRemind</span>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
            Sürüm 1.2.0 (PWA)
          </span>
        </div>
        <p className="text-[11px]">
          Kişiselleştirilmiş, Reklamsız İlaç ve Su Hatırlatıcısı
        </p>
      </div>
    </div>
  );
};