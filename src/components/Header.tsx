import React from 'react';
import { BellRing } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Header: React.FC = () => {
  const { testAlarm } = useApp();

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all pt-safe">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        {/* Logo and title */}
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-600 to-cyan-500 flex items-center justify-center shadow-md shadow-teal-500/20 text-white font-black text-xl tracking-tighter">
            V+
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-900 tracking-tight leading-none">
              VitaRemind
            </h1>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
              Kişiselleştirilmiş İlaç ve Su Hatırlatıcı
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {/* Quick Alarm Test Button */}
          <button
            onClick={() => testAlarm('medication')}
            title="Hatırlatıcı sesini ve uyarısını hemen test edin"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 active:scale-95 text-slate-700 text-xs font-semibold transition"
          >
            <BellRing className="w-3.5 h-3.5 text-teal-600" />
            <span>Alarm Test</span>
          </button>
        </div>
      </div>
    </header>
  );
};
