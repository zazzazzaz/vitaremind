import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Bell, 
  Volume2, 
  Vibrate, 
  Download, 
  Upload, 
  RotateCcw, 
  Check, 
  Smartphone, 
  Play, 
  User, 
  CheckCircle2,
  Key
} from 'lucide-react';
import { 
  requestNotificationPermission, 
  getNotificationPermission, 
  sendLocalNotification,
  scheduleTestNotificationViaWorker 
} from '../services/notificationService';
import { playPillReminderSound, triggerVibration } from '../services/soundService';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const SettingsTab: React.FC = () => {
  const {
    appSettings,
    updateAppSettings,
    testAlarm,
    exportData,
    importData,
    resetAllData,
  } = useApp();

  const { isInstallable, isInstalled, install } = usePWAInstall();

  const [notificationStatus, setNotificationStatus] = useState<NotificationPermission>(() =>
    getNotificationPermission()
  );
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [showAndroidNotifModal, setShowAndroidNotifModal] = useState(false);
  const [lockScreenCountdown, setLockScreenCountdown] = useState<number | null>(null);
  const [importSuccessMsg, setImportSuccessMsg] = useState('');
  const [importErrorMsg, setImportErrorMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const testLockScreenNotification = async () => {
    // 1. Immediately schedule in Service Worker with native trigger / worker timer
    await scheduleTestNotificationViaWorker(8000);

    // 2. Visual countdown in UI
    setLockScreenCountdown(8);
    let secondsLeft = 8;

    const timer = setInterval(() => {
      secondsLeft -= 1;
      if (secondsLeft <= 0) {
        clearInterval(timer);
        setLockScreenCountdown(null);
      } else {
        setLockScreenCountdown(secondsLeft);
      }
    }, 1000);
  };

  const handleRequestPermission = async () => {
    const perm = await requestNotificationPermission();
    setNotificationStatus(perm);
    if (perm === 'granted') {
      updateAppSettings({ notificationsEnabled: true });
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
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Ayarlar & Kişiselleştirme</h2>
        <p className="text-xs text-slate-500 font-medium">
          Uygulama seslerini, yapay zeka anahtarınızı ve kişisel tercihlerinizi özelleştirin
        </p>
      </div>

      {/* User Name / Profile */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
          <User className="w-4 h-4 text-teal-600" />
          <span>Kişisel Bilgiler</span>
        </h3>
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Size Nasıl Hitap Edelim?
          </label>
          <input
            type="text"
            value={appSettings.userName}
            onChange={(e) => updateAppSettings({ userName: e.target.value })}
            placeholder="Adınız"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-bold text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-hidden"
          />
        </div>
      </div>

      {/* Gemini API Key Setting Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <Key className="w-4 h-4 text-teal-600" />
            <span>Google Gemini API Anahtarı</span>
          </h3>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
            Kişisel
          </span>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          İlaç kutusunu fotoğraflayarak veya aratarak otomatik tanıma özelliğini kullanmak için kendi ücretsiz Gemini API anahtarınızı girebilirsiniz. Anahtarınız sadece bu cihazın hafızasında saklanır.
        </p>

        <div className="space-y-1.5 pt-1">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            API Anahtarı (AIzaSy...)
          </label>
          <input
            type="password"
            value={appSettings.geminiApiKey || ''}
            onChange={(e) => updateAppSettings({ geminiApiKey: e.target.value.trim() })}
            placeholder="AIzaSy..."
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-mono text-xs focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-hidden"
          />
        </div>

        <div className="flex items-center justify-between pt-1">
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-teal-700 font-bold hover:underline inline-flex items-center gap-1"
          >
            <span>Ücretsiz Google API Anahtarı Al</span>
            <span>↗</span>
          </a>
          {appSettings.geminiApiKey && (
            <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              <span>Anahtar Kaydedildi</span>
            </span>
          )}
        </div>
      </div>

      {/* Notifications & Sound Settings */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-5">
        <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
          <Bell className="w-4 h-4 text-teal-600" />
          <span>Bildirimler & Ses Efektleri</span>
        </h3>

        {/* Browser Notification Status */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-800">Cihaz Bildirim İzni:</span>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  notificationStatus === 'granted'
                    ? 'bg-emerald-100 text-emerald-800'
                    : notificationStatus === 'denied'
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {notificationStatus === 'granted'
                  ? 'Aktif (İzin Verildi)'
                  : notificationStatus === 'denied'
                  ? 'Engellendi'
                  : 'İzin Bekleniyor'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Telefonunuz kilitliyken veya uygulama arka plandayken bildirim alabilmek için izin gereklidir.
            </p>
          </div>

          {notificationStatus !== 'granted' && (
            <button
              onClick={handleRequestPermission}
              className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition shrink-0"
            >
              Bildirim İzni İste
            </button>
          )}
        </div>

        {/* Lock Screen Test & Android Background Guide Buttons */}
        <div className="p-3.5 rounded-2xl bg-teal-50 border border-teal-200/90 space-y-2.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs font-bold text-teal-950 block">
                📱 Kilitli Ekran / Arka Plan Bildirim Testi
              </span>
              <p className="text-[11px] text-teal-800">
                Butona bastıktan sonra telefonunuzun ekranını kapatıp kilitleyin. Servis Çalışanı (Service Worker) 8 saniye sonra kilit ekranına bildirim düşürecektir.
              </p>
            </div>

            <button
              type="button"
              onClick={testLockScreenNotification}
              disabled={lockScreenCountdown !== null}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shrink-0 ${
                lockScreenCountdown !== null
                  ? 'bg-amber-500 text-white animate-pulse'
                  : 'bg-teal-700 hover:bg-teal-800 text-white shadow-xs'
              }`}
            >
              {lockScreenCountdown !== null ? (
                <span>Ekranı Kilitleyin! ({lockScreenCountdown}s)</span>
              ) : (
                <span>8 sn Sonra Gönder</span>
              )}
            </button>
          </div>

          <div className="pt-2 border-t border-teal-200 flex items-center justify-between">
            <span className="text-[11px] text-teal-800 font-medium">
              Ekran kapalıyken telefonunuz bildirimleri engelliyor mu?
            </span>
            <button
              type="button"
              onClick={() => setShowAndroidNotifModal(true)}
              className="text-xs font-bold text-teal-800 hover:text-teal-950 underline"
            >
              Android Ayar Rehberi
            </button>
          </div>
        </div>

        {/* Sound toggle & tone selection */}
        <div className="space-y-4 pt-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-teal-600" />
              <span className="text-xs font-bold text-slate-800">Hatırlatma Sesi Çalsın</span>
            </div>
            <input
              type="checkbox"
              checked={appSettings.soundEnabled}
              onChange={(e) => updateAppSettings({ soundEnabled: e.target.checked })}
              className="w-5 h-5 text-teal-600 rounded-md border-slate-300 focus:ring-teal-500"
            />
          </div>

          {appSettings.soundEnabled && (
            <>
              {/* Tone selection */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Alarm Melodisi
                  </label>
                  <button
                    type="button"
                    onClick={testCurrentTone}
                    className="text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1"
                  >
                    <Play className="w-3 h-3 fill-teal-600" />
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
                          ? 'bg-teal-50 border-teal-600 text-teal-900 shadow-2xs'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Volume Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>Ses Seviyesi</span>
                  <span className="text-teal-700">%{appSettings.soundVolume}</span>
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
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <Vibrate className="w-4 h-4 text-teal-600" />
              <div>
                <span className="text-xs font-bold text-slate-800 block">Titreşim (Haptik)</span>
                <span className="text-[11px] text-slate-400">
                  Uyumlu Android cihazlarda titreşim uyarısı
                </span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={appSettings.vibrationEnabled}
              onChange={(e) => updateAppSettings({ vibrationEnabled: e.target.checked })}
              className="w-5 h-5 text-teal-600 rounded-md border-slate-300 focus:ring-teal-500"
            />
          </div>
        </div>
      </div>

      {/* Instant Test Alarms */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-3">
        <h3 className="font-bold text-slate-900 text-base">Hatırlatıcı Simülatörü & Test</h3>
        <p className="text-xs text-slate-500">
          Saat beklemeden seslerin, titreşimin ve alarm ekranının nasıl göründüğünü hemen test edin:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <button
            onClick={() => testAlarm('medication')}
            className="p-3.5 rounded-2xl bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-900 font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition"
          >
            <span>💊 İlaç Alarmını Test Et</span>
          </button>

          <button
            onClick={() => testAlarm('water')}
            className="p-3.5 rounded-2xl bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-900 font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition"
          >
            <span>💧 Su Alarmını Test Et</span>
          </button>
        </div>
      </div>

      {/* Android & PWA Installation Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-teal-600" />
            <span>Android / PWA Kurulum Durumu</span>
          </h3>
          {isInstalled && (
            <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
              ✓ Yüklü
            </span>
          )}
        </div>

        <p className="text-xs text-slate-500 leading-relaxed">
          VitaRemind, tam uyumlu bir Progresif Web Uygulamasıdır (PWA). Telefonunuza kurarak reklam olmadan, çevrimdışı ve bağımsız bir Android uygulaması gibi kullanabilirsiniz.
        </p>

        {isInstalled ? (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
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
            <p className="text-[11px] text-slate-400 text-center">
              Chrome menüsündeki üç nokta (⋮) butonundan da "Uygulamayı Yükle" diyebilirsiniz.
            </p>
          </div>
        )}
      </div>

      {/* Guide modal if opened from settings */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl text-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-teal-600" />
                <h3 className="text-base font-bold text-slate-900">Telefona Kolay Kurulum</h3>
              </div>
              <button
                onClick={() => setShowGuideModal(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600">
              <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900">
                <strong>💡 Dikkat:</strong> Bağlantıyı Google AI Studio editörünün içinde değil, doğrudan uygulamanın kendi bağlantısında açtığınızdan emin olun.
              </div>

              <div className="p-3 bg-teal-50 rounded-2xl border border-teal-100 space-y-1">
                <span className="font-bold text-teal-900 block text-xs">📱 Android (Chrome):</span>
                <p>1. Chrome'un sağ üst köşesindeki <strong>üç nokta (⋮)</strong> simgesine dokunun.</p>
                <p>2. Menüden <strong>"Uygulamayı Yükle"</strong> (veya "Ana Ekrana Ekle") butonuna dokunun.</p>
                <p>3. Karşınıza <strong>VitaRemind</strong> onay penceresi gelecektir.</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900 block text-xs">🍎 iPhone (Safari):</span>
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

      {/* Android Lock Screen & Background Settings Guide Modal */}
      {showAndroidNotifModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl text-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-teal-600" />
                <h3 className="text-base font-bold text-slate-900">Kilitli Ekran & Arka Plan Ayarları</h3>
              </div>
              <button
                onClick={() => setShowAndroidNotifModal(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Android telefonlar (özellikle Xiaomi, Samsung, Huawei, Oppo) pil tasarrufu sağlamak için ekran kapandığında uygulamaların arka plan çalışmasını uyutabilir. Bildirimlerin her an sorunsuz çalması için telefonunuzda şu 3 ayarı kontrol edin:
            </p>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 bg-teal-50 rounded-2xl border border-teal-100 space-y-1">
                <span className="font-bold text-teal-950 block text-xs">
                  1. Pil Tasarrufu Kısıtlamasını Kaldırın (En Önemlisi ⚡)
                </span>
                <p className="text-slate-600">
                  Telefonunuzun <strong>Ayarlar &gt; Uygulamalar &gt; Chrome (veya VitaRemind) &gt; Pil</strong> bölümüne gidin.
                </p>
                <p className="text-teal-900 font-semibold">
                  👉 <strong>"Kısıtlanmadı" (Unrestricted / Sınırsız)</strong> seçeneğini işaretleyin. Böylece ekran kapalıyken sistem uygulamayı dondurmaz.
                </p>
              </div>

              <div className="p-3 bg-sky-50 rounded-2xl border border-sky-100 space-y-1">
                <span className="font-bold text-sky-950 block text-xs">
                  2. Kilit Ekranı Bildirim İzni
                </span>
                <p className="text-slate-600">
                  <strong>Ayarlar &gt; Bildirimler &gt; Kilit Ekranı Bildirimleri</strong> kısmında <strong>"İçeriği Göster"</strong> seçili olmalıdır.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900 block text-xs">
                  3. Uygulamayı Kapatırken
                </span>
                <p className="text-slate-600">
                  Uygulamayı kullanmadığınızda telefonun orta tuşuyla (Home) ana ekrana dönün veya arka planda bırakın. Son uygulamalar ekranından yukarı kaydırıp tamamen zorla kapatırsanız Android tüm tarayıcı işlemlerini sonlandırır.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowAndroidNotifModal(false)}
              className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs transition"
            >
              Anladım, Teşekkürler
            </button>
          </div>
        </div>
      )}

      {/* Data Backup & Restore */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-900 text-base">Veri Yedekleme & Geri Yükleme</h3>
        <p className="text-xs text-slate-500">
          İlaçlarınızı, içtiğiniz suları ve kişisel saatlerinizi yedekleyebilir veya başka bir telefona aktarabilirsiniz.
        </p>

        {importSuccessMsg && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{importSuccessMsg}</span>
          </div>
        )}

        {importErrorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold">
            {importErrorMsg}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={exportData}
            className="py-3 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition"
          >
            <Download className="w-4 h-4 text-teal-600" />
            <span>Yedeği İndir (.json)</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="py-3 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition"
          >
            <Upload className="w-4 h-4 text-teal-600" />
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

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500">Tüm verileri temizle:</span>
          <button
            onClick={() => {
              if (confirm('Tüm ilaç ve su kayıtlarınız silinerek varsayılan ayarlara dönülecek. Onaylıyor musunuz?')) {
                resetAllData();
              }
            }}
            className="text-xs font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Varsayılana Sıfırla</span>
          </button>
        </div>
      </div>

      {/* App Version & Credits Card */}
      <div className="text-center py-4 space-y-1 text-slate-400">
        <div className="flex items-center justify-center gap-2">
          <span className="font-extrabold text-xs text-slate-700">VitaRemind</span>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
            Sürüm 1.2.0 (PWA)
          </span>
        </div>
        <p className="text-[11px] text-slate-500">
          Kişiselleştirilmiş, Reklamsız İlaç ve Su Hatırlatıcısı
        </p>
      </div>
    </div>
  );
};
