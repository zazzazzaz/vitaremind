import React from 'react';
import { useApp, formatInstructions } from '../context/AppContext';
import { Bell, Droplets, Pill, Check, Clock, X, ShieldAlert, Sparkles } from 'lucide-react';

export const AlarmModal: React.FC = () => {
  const { activeAlarm, recordDose, addWater, snoozeCurrentAlarm, dismissCurrentAlarm } = useApp();

  if (!activeAlarm) return null;

  const isWater = activeAlarm.type === 'water';
  const med = activeAlarm.medication;

  const handleTakeMed = () => {
    if (med && activeAlarm.scheduledTime) {
      recordDose(med.id, activeAlarm.scheduledTime, 'taken');
    } else {
      dismissCurrentAlarm();
    }
  };

  const handleSkipMed = () => {
    if (med && activeAlarm.scheduledTime) {
      recordDose(med.id, activeAlarm.scheduledTime, 'skipped');
    } else {
      dismissCurrentAlarm();
    }
  };

  const handleDrinkWater = (amountMl: number) => {
    addWater(amountMl);
    dismissCurrentAlarm();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden transform animate-in zoom-in-95 duration-200">
        {/* Top Header Glow */}
        <div
          className={`p-6 text-white text-center relative overflow-hidden ${
            isWater
              ? 'bg-gradient-to-br from-cyan-500 via-sky-600 to-blue-700'
              : 'bg-gradient-to-br from-teal-500 via-emerald-600 to-teal-800'
          }`}
        >
          {/* Animated Glow Circle */}
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />

          <button
            onClick={dismissCurrentAlarm}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/10 hover:bg-black/20 text-white/90 transition"
            aria-label="Kapat"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 backdrop-blur-md border border-white/30 shadow-lg mb-3 animate-bounce">
            {isWater ? (
              <Droplets className="w-10 h-10 text-white fill-white/20" />
            ) : (
              <Pill className="w-10 h-10 text-white" />
            )}
          </div>

          <h2 className="text-2xl font-black tracking-tight">{activeAlarm.title}</h2>
          <p className="text-white/80 text-sm mt-1 max-w-xs mx-auto">{activeAlarm.description}</p>
        </div>

        {/* Modal Body */}
        <div className="p-6 bg-slate-50 space-y-4">
          {!isWater && med && (
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <span>Doz Detayı</span>
                <span className="text-teal-600 font-bold">{activeAlarm.scheduledTime}</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-bold text-slate-900">{med.name}</h4>
                  <p className="text-sm text-slate-600">
                    {med.dosage} • {formatInstructions(med.instructions)}
                  </p>
                </div>
                {med.stockEnabled && (
                  <div className="text-right">
                    <span className="text-xs text-slate-500 block">Kalan Stok</span>
                    <span
                      className={`text-sm font-bold ${
                        med.stockCount <= med.stockAlertThreshold ? 'text-amber-600' : 'text-slate-700'
                      }`}
                    >
                      {med.stockCount} adet
                    </span>
                  </div>
                )}
              </div>

              {med.notes && (
                <div className="pt-2 border-t border-slate-100 text-xs text-slate-500 italic">
                  💡 Not: "{med.notes}"
                </div>
              )}
            </div>
          )}

          {isWater && (
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm text-center space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Ne kadar su içtiniz?
              </p>
              <div className="grid grid-cols-3 gap-2">
                {[200, 250, 330].map((ml) => (
                  <button
                    key={ml}
                    onClick={() => handleDrinkWater(ml)}
                    className="py-3 px-2 rounded-xl bg-sky-50 border border-sky-200 text-sky-800 font-bold text-sm hover:bg-sky-500 hover:text-white transition active:scale-95 shadow-xs flex flex-col items-center gap-0.5"
                  >
                    <Droplets className="w-4 h-4 text-sky-500 hover:text-white" />
                    <span>+{ml} ml</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            {!isWater ? (
              <>
                <button
                  onClick={handleTakeMed}
                  className="w-full py-3.5 px-4 rounded-2xl bg-teal-600 hover:bg-teal-700 active:scale-[0.99] text-white font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-teal-600/25 transition"
                >
                  <Check className="w-5 h-5 stroke-[2.5]" />
                  <span>Şimdi İçtim</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => snoozeCurrentAlarm(15)}
                    className="py-2.5 px-3 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-100 flex items-center justify-center gap-1.5 transition"
                  >
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    <span>15 Dk Ertele</span>
                  </button>

                  <button
                    onClick={handleSkipMed}
                    className="py-2.5 px-3 rounded-xl bg-white border border-slate-200 text-rose-600 font-semibold text-xs hover:bg-rose-50 flex items-center justify-center gap-1.5 transition"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Bu Dozu Atla</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => snoozeCurrentAlarm(20)}
                  className="flex-1 py-3 px-4 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-100 flex items-center justify-center gap-1.5 transition"
                >
                  <Clock className="w-4 h-4 text-slate-500" />
                  <span>20 Dk Ertele</span>
                </button>
                <button
                  onClick={dismissCurrentAlarm}
                  className="py-3 px-5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold text-sm transition"
                >
                  Kapat
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
