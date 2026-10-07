import React, { useState } from 'react';
import { useApp, formatInstructions } from '../context/AppContext';
import { 
  Check, 
  Clock, 
  X, 
  RotateCcw, 
  Droplets, 
  Plus, 
  AlertTriangle, 
  Pill, 
  Calendar, 
  ChevronRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

interface TodayTabProps {
  onNavigateToTab: (tab: 'medications' | 'water') => void;
  onOpenAddMed: () => void;
}

export const TodayTab: React.FC<TodayTabProps> = ({ onNavigateToTab, onOpenAddMed }) => {
  const {
    medications,
    todayPillsDue,
    todayWaterTotal,
    todayWaterPercentage,
    waterSettings,
    addWater,
    undoLastWaterLog,
    recordDose,
    undoDose,
    appSettings,
  } = useApp();

  const [snoozeSelectMedKey, setSnoozeSelectMedKey] = useState<string | null>(null);

  // Date formatting
  const today = new Date();
  const dateFormatted = today.toLocaleDateString('tr-TR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  // Calculate statistics
  const totalPillsToday = todayPillsDue.length;
  const takenPillsToday = todayPillsDue.filter((p) => p.log?.status === 'taken').length;
  const pillProgressPct = totalPillsToday > 0 ? Math.round((takenPillsToday / totalPillsToday) * 100) : 100;

  // Find next upcoming dose
  const now = new Date();
  const currentHM = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const upcomingDose = todayPillsDue.find(
    (p) => (!p.log || p.log.status === 'snoozed') && p.time >= currentHM
  ) || todayPillsDue.find((p) => !p.log || p.log.status === 'snoozed');

  // Low stock medications
  const lowStockMeds = medications.filter(
    (m) => m.active && m.stockEnabled && m.stockCount <= m.stockAlertThreshold
  );

  return (
    <div className="space-y-6 pb-24 max-w-4xl mx-auto px-4 pt-4">
      {/* Date & Welcome Banner */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <Calendar className="w-3.5 h-3.5 text-teal-600" />
            <span>{dateFormatted}</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
            Merhaba, {appSettings.userName || 'Kullanıcı'} 👋
          </h2>
        </div>
      </div>

      {/* Low Stock Warning Banner */}
      {lowStockMeds.length > 0 && (
        <div className="bg-amber-50 border border-amber-200/90 rounded-2xl p-4 flex items-start gap-3 shadow-xs">
          <div className="p-2 rounded-xl bg-amber-100 text-amber-700 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-amber-900">İlaç Stoğu Azalıyor!</h4>
            <p className="text-xs text-amber-800 mt-0.5">
              {lowStockMeds.map((m) => `${m.name} (${m.stockCount} adet kaldı)`).join(', ')}. Eczaneden temin etmeyi unutmayın.
            </p>
          </div>
          <button
            onClick={() => onNavigateToTab('medications')}
            className="text-xs font-bold text-amber-800 hover:text-amber-950 underline shrink-0"
          >
            Stoğu İncele
          </button>
        </div>
      )}

      {/* Progress Cards: Water & Medication */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Water Daily Card */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center font-bold">
                <Droplets className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Günlük Su Takibi</h3>
                <p className="text-xs text-slate-500">Hedef: {waterSettings.dailyGoalMl} ml</p>
              </div>
            </div>
            <button
              onClick={() => onNavigateToTab('water')}
              className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-0.5"
            >
              <span>Detay</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Progress bar */}
          <div className="space-y-1.5 mb-4">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-700 font-bold">{todayWaterTotal} ml</span>
              <span className="text-sky-600 font-bold">%{todayWaterPercentage}</span>
            </div>
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5">
              <div
                className="h-full bg-gradient-to-r from-sky-400 to-cyan-500 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${Math.min(100, todayWaterPercentage)}%` }}
              />
            </div>
          </div>

          {/* Quick add water buttons & Undo */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Hızlı Su Ekle
              </span>
              {todayWaterTotal > 0 && (
                <button
                  type="button"
                  onClick={undoLastWaterLog}
                  title="Son eklenen suyu geri al"
                  className="text-[11px] font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 transition"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Son Eklemeyi Geri Al</span>
                </button>
              )}
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[200, 250, 330, 500].map((ml) => (
                <button
                  key={ml}
                  onClick={() => addWater(ml)}
                  className="py-2 px-1 rounded-xl bg-slate-50 hover:bg-sky-50 border border-slate-200/80 hover:border-sky-300 text-slate-700 hover:text-sky-700 font-bold text-xs active:scale-95 transition flex flex-col items-center gap-0.5"
                >
                  <Plus className="w-3 h-3 text-sky-500" />
                  <span>+{ml}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Medication Daily Card */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-600 flex items-center justify-center font-bold">
                <Pill className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Bugünkü İlaçlarım</h3>
                <p className="text-xs text-slate-500">
                  {totalPillsToday} dozdan {takenPillsToday} tanesi alındı
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigateToTab('medications')}
              className="text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center gap-0.5"
            >
              <span>İlaçlarım</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Progress bar */}
          <div className="space-y-1.5 mb-4">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-700 font-bold">
                {takenPillsToday} / {totalPillsToday} Doz
              </span>
              <span className="text-teal-600 font-bold">%{pillProgressPct}</span>
            </div>
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5">
              <div
                className="h-full bg-gradient-to-r from-teal-400 to-emerald-500 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${pillProgressPct}%` }}
              />
            </div>
          </div>

          {/* Adherence status badge */}
          <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span className="text-slate-700 font-medium">
                {takenPillsToday === totalPillsToday && totalPillsToday > 0
                  ? 'Harika! Bugünün tüm ilaçları tamamlandı 🎉'
                  : `${totalPillsToday - takenPillsToday} doz ilaç daha alınmayı bekliyor.`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Dose Highlight Banner */}
      {upcomingDose && (
        <div className="bg-gradient-to-r from-teal-800 to-slate-900 text-white rounded-3xl p-5 shadow-lg relative overflow-hidden">
          <div className="absolute right-0 top-0 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
            <div>
              <div className="flex items-center gap-2 text-teal-300 text-xs font-bold uppercase tracking-wider mb-1">
                <Clock className="w-3.5 h-3.5" />
                <span>Sıradaki Hatırlatıcı ({upcomingDose.time})</span>
              </div>
              <h3 className="text-xl font-bold">{upcomingDose.med.name}</h3>
              <p className="text-xs text-teal-100/90 mt-0.5">
                {upcomingDose.med.dosage} • {formatInstructions(upcomingDose.med.instructions)}
                {upcomingDose.med.notes && ` • ${upcomingDose.med.notes}`}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => recordDose(upcomingDose.med.id, upcomingDose.time, 'taken')}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 active:scale-95 text-white font-bold text-xs shadow-md transition"
              >
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>Şimdi İçtim</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Today's Medication Timeline */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">Günün İlaç Programı</h3>
          <button
            onClick={onOpenAddMed}
            className="flex items-center gap-1 text-xs font-bold text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-xl border border-teal-200 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Yeni İlaç Ekle</span>
          </button>
        </div>

        {todayPillsDue.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 border border-slate-200/80 text-center space-y-3 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto">
              <Pill className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-800">Bugün için planlanmış ilaç bulunmuyor</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Günlük aldığınız vitamin veya reçeteli ilaçları ekleyerek otomatik hatırlatıcıları başlatabilirsiniz.
            </p>
            <button
              onClick={onOpenAddMed}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs transition"
            >
              <Plus className="w-4 h-4" />
              <span>İlk İlacınızı Ekleyin</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {todayPillsDue.map((item) => {
              const { med, time, log } = item;
              const isTaken = log?.status === 'taken';
              const isSkipped = log?.status === 'skipped';
              const isSnoozed = log?.status === 'snoozed';
              const key = `${med.id}_${time}`;

              // Color styles
              let badgeColor = 'bg-teal-100 text-teal-800 border-teal-200';
              if (med.color === 'sky') badgeColor = 'bg-sky-100 text-sky-800 border-sky-200';
              if (med.color === 'violet') badgeColor = 'bg-purple-100 text-purple-800 border-purple-200';
              if (med.color === 'amber') badgeColor = 'bg-amber-100 text-amber-800 border-amber-200';
              if (med.color === 'rose') badgeColor = 'bg-rose-100 text-rose-800 border-rose-200';

              return (
                <div
                  key={key}
                  className={`rounded-2xl p-4 border transition-all ${
                    isTaken
                      ? 'border-emerald-200 bg-emerald-50/30'
                      : isSkipped
                      ? 'border-slate-200 bg-white opacity-60'
                      : 'border-slate-200/90 bg-white shadow-xs hover:border-teal-300'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Med Info */}
                    <div className="flex items-start gap-3">
                      {/* Time pill */}
                      <div className="flex flex-col items-center justify-center w-14 py-2 rounded-xl bg-slate-100 border border-slate-200/80 shrink-0">
                        <span className="text-xs font-black text-slate-800 tracking-tight">{time}</span>
                        <span className="text-[10px] text-slate-500 font-medium">Saat</span>
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4
                            className={`text-base font-bold ${
                              isTaken
                                ? 'line-through text-slate-400'
                                : 'text-slate-900'
                            }`}
                          >
                            {med.name}
                          </h4>
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${badgeColor}`}
                          >
                            {med.dosage}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-1 flex-wrap">
                          <span>{formatInstructions(med.instructions)}</span>
                          {med.stockEnabled && (
                            <>
                              <span>•</span>
                              <span
                                className={
                                  med.stockCount <= med.stockAlertThreshold
                                    ? 'text-amber-700 font-bold'
                                    : ''
                                }
                              >
                                Kalan: {med.stockCount} adet
                              </span>
                            </>
                          )}
                        </div>

                        {med.notes && (
                          <p className="text-[11px] text-slate-500 italic mt-0.5 line-clamp-1">
                            {med.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      {isTaken ? (
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-1.5 rounded-xl">
                            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                            <span>İçildi</span>
                          </span>
                          <button
                            onClick={() => undoDose(med.id, time)}
                            title="Geri Al"
                            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : isSkipped ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1.5 rounded-xl">
                            Atlandı
                          </span>
                          <button
                            onClick={() => undoDose(med.id, time)}
                            title="Geri Al"
                            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          {/* Taken Button */}
                          <button
                            onClick={() => recordDose(med.id, time, 'taken')}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs active:scale-95 transition"
                          >
                            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                            <span>İçtim</span>
                          </button>

                          {/* Snooze Dropdown/Button */}
                          <div className="relative">
                            <button
                              onClick={() =>
                                setSnoozeSelectMedKey(snoozeSelectMedKey === key ? null : key)
                              }
                              title="Ertele"
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition"
                            >
                              <Clock className="w-3.5 h-3.5 text-amber-500" />
                              <span className="hidden xs:inline">Ertele</span>
                            </button>

                            {snoozeSelectMedKey === key && (
                              <div className="absolute right-0 top-full mt-1 z-30 bg-white border border-slate-200 rounded-xl shadow-xl p-1.5 min-w-[120px] text-xs space-y-1">
                                {[15, 30, 60].map((min) => (
                                  <button
                                    key={min}
                                    onClick={() => {
                                      recordDose(med.id, time, 'snoozed', min);
                                      setSnoozeSelectMedKey(null);
                                    }}
                                    className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-amber-50 text-slate-700 hover:text-amber-800 font-medium"
                                  >
                                    +{min} dakika
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Skip Button */}
                          <button
                            onClick={() => recordDose(med.id, time, 'skipped')}
                            title="Bu dozu atla"
                            className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {isSnoozed && log?.snoozeUntil && (
                    <div className="mt-2 text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg inline-flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>
                        Saat {new Date(log.snoozeUntil).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                        'a kadar ertelendi.
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
