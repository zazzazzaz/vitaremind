import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, X, CheckCircle, Info, ChevronRight } from 'lucide-react';

export const PWAInstallBanner: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [showAndroidGuideModal, setShowAndroidGuideModal] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // If already installed or dismissed, hide the banner
  if (isInstalled || dismissed) {
    return null;
  }

  return (
    <>
      <div className="bg-gradient-to-r from-teal-700 via-teal-800 to-slate-900 text-white px-4 py-3 shadow-md relative z-40 transition-all">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/20 shadow-inner">
              <Smartphone className="w-5 h-5 text-teal-300" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-semibold text-sm tracking-tight text-white">VitaRemind'ı Telefona Yükle</span>
                <span className="text-[10px] bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 px-1.5 py-0.5 rounded-full font-medium">
                  %100 Reklamsız
                </span>
              </div>
              <p className="text-xs text-teal-100/90 truncate">
                Ana ekranınıza ekleyip gerçek bir Android uygulaması gibi tam ekran ve çevrimdışı kullanın.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                if (isInstallable) {
                  install();
                } else if (isIOS) {
                  setShowIOSModal(true);
                } else {
                  setShowAndroidGuideModal(true);
                }
              }}
              className="flex items-center gap-1.5 bg-white text-teal-900 font-bold px-3 py-1.5 rounded-lg text-xs hover:bg-teal-50 active:scale-95 transition shadow-sm"
            >
              <Download className="w-3.5 h-3.5 text-teal-700" />
              <span>{isInstallable ? 'Hemen Yükle' : 'Telefona Yükle'}</span>
            </button>

            <button
              onClick={() => setDismissed(true)}
              aria-label="Kapat"
              className="p-1 rounded-md text-white/70 hover:text-white hover:bg-white/10 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* iOS Instructions Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl text-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-teal-600" />
                <h3 className="text-base font-bold text-slate-900">iPhone / iPad'e Yükleme</h3>
              </div>
              <button
                onClick={() => setShowIOSModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-sm text-slate-600 mb-5">
              <div className="flex items-start gap-2.5">
                <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center shrink-0 text-xs">
                  1
                </span>
                <p>
                  Safari tarayıcısının altındaki <strong className="text-slate-800">Paylaş</strong> (kare içinden ok çıkan) simgesine dokunun.
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center shrink-0 text-xs">
                  2
                </span>
                <p>
                  Açılan menüde aşağı kaydırarak <strong className="text-slate-800">"Ana Ekrana Ekle"</strong> seçeneğine dokunun.
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center shrink-0 text-xs">
                  3
                </span>
                <p>
                  Sağ üst köşedeki <strong className="text-slate-800">"Ekle"</strong> butonuna basın. VitaRemind uygulama gibi telefonunuza kurulacaktır!
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-xl text-sm transition"
            >
              Anladım
            </button>
          </div>
        </div>
      )}

      {/* Android Manual Guide Modal */}
      {showAndroidGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl text-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-teal-600" />
                <h3 className="text-base font-bold text-slate-900">Android Cihaza Yükleme</h3>
              </div>
              <button
                onClick={() => setShowAndroidGuideModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-sm text-slate-600 mb-5">
              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900">
                <strong>⚠️ Önemli Not:</strong> Eğer bu sayfayı Google AI Studio düzenleyicisinin içindeki önizlemeden açtıysanız, telefon doğrudan AI Studio platformunu kurmaya çalışır. 
                Uygulamanın kendisini kurmak için aşağıdaki adımı uygulayın:
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center shrink-0 text-xs">
                  1
                </span>
                <p>
                  Tarayıcınızın adres çubuğundaki bağlantının doğrudan uygulamanın kendi adresi (<strong>ais-dev-*.run.app</strong>) olduğundan emin olun.
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center shrink-0 text-xs">
                  2
                </span>
                <p>
                  Chrome'un sağ üstündeki <strong className="text-slate-800">üç nokta (⋮)</strong> menüsüne tıklayın.
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center shrink-0 text-xs">
                  3
                </span>
                <p>
                  <strong className="text-slate-800">"Uygulamayı Yükle"</strong> veya <strong className="text-slate-800">"Ana Ekrana Ekle"</strong> butonuna dokunun. Ekranda <strong>"VitaRemind"</strong> logosu ve ismi görünecektir.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowAndroidGuideModal(false)}
              className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-xl text-sm transition"
            >
              Tamamdır
            </button>
          </div>
        </div>
      )}
    </>
  );
};
