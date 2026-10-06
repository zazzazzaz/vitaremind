import React from 'react';
import { ShieldCheck, BellRing, Smartphone, Maximize, Minimize } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { useFullscreen } from '../hooks/useFullscreen';

export const Header: React.FC = () => {
  const { testAlarm } = useApp();
  const { isInstallable, install } = usePWAInstall();
  const { isFullscreen, toggleFullscreen } = useFullscreen();

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all shadow-2xs">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        {/* Logo and title */}
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-600 to-cyan-500 flex items-center justify-center shadow-md shadow-teal-500/20 text-white font-black text-xl tracking-tighter">
            V+
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black text-slate-900 tracking-tight leading-none">
                VitaRemind
              </h1>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-teal-100 text-teal-800 border border-teal-200">
                v1.2.0
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
                <ShieldCheck className="w-3 h-3" />
                Reklamsız
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Kişiselleştirilmiş İlaç ve Su Hatırlatıcı
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {/* Direct Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Tam ekrandan çık' : 'Tam ekrana geç (Adres çubuğunu gizle)'}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 active:scale-95 text-teal-800 text-xs font-semibold border border-teal-200/80 transition"
          >
            {isFullscreen ? (
              <>
                <Minimize className="w-3.5 h-3.5 text-teal-700" />
                <span className="hidden xs:inline">Normale Dön</span>
              </>
            ) : (
              <>
                <Maximize className="w-3.5 h-3.5 text-teal-700" />
                <span>Tam Ekran</span>
              </>
            )}
          </button>

          {/* Quick Alarm Test Button */}
          <button
            onClick={() => testAlarm('medication')}
            title="Hatırlatıcı sesini ve uyarısını hemen test edin"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 text-xs font-semibold transition"
          >
            <BellRing className="w-3.5 h-3.5 text-teal-600" />
            <span className="hidden xs:inline">Alarm Test</span>
          </button>

          {isInstallable && (
            <button
              onClick={install}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-95 text-white text-xs font-bold shadow-xs shadow-teal-600/30 transition"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Yükle</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
