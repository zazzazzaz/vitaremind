import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  BarChart3, 
  Flame, 
  Droplets, 
  Pill, 
  Award
} from 'lucide-react';

export const HistoryTab: React.FC = () => {
  const { doseLogs, waterLogs, waterSettings } = useApp();

  // Generate last 7 days array
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    const dayName = d.toLocaleDateString('tr-TR', { weekday: 'short' });
    const dayNum = d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });

    // Water total for day
    const dayWater = waterLogs
      .filter((w) => w.date === dateStr)
      .reduce((sum, item) => sum + item.amountMl, 0);

    // Pill taken for day
    const dayDosesTaken = doseLogs.filter(
      (l) => l.date === dateStr && l.status === 'taken'
    ).length;

    const dayDosesTotal = doseLogs.filter(
      (l) => l.date === dateStr
    ).length;

    return {
      dateStr,
      dayName,
      dayNum,
      waterMl: dayWater,
      waterGoal: waterSettings.dailyGoalMl,
      waterPct: Math.min(100, Math.round((dayWater / waterSettings.dailyGoalMl) * 100)),
      dosesTaken: dayDosesTaken,
      dosesTotal: dayDosesTotal,
    };
  });

  // Calculate Streak: consecutive days with at least 1 dose or water recorded
  let streakDays = 0;
  for (let i = last7Days.length - 1; i >= 0; i--) {
    if (last7Days[i].waterMl > 0 || last7Days[i].dosesTaken > 0) {
      streakDays++;
    } else if (i < last7Days.length - 1) {
      // Break streak only if not today
      break;
    }
  }

  // Lifetime / aggregate stats
  const totalWaterAllTime = waterLogs.reduce((sum, item) => sum + item.amountMl, 0);
  const totalPillsTakenAllTime = doseLogs.filter((l) => l.status === 'taken').length;
  const totalPillsScheduled = doseLogs.length;
  const overallAdherence = totalPillsScheduled > 0
    ? Math.round((totalPillsTakenAllTime / totalPillsScheduled) * 100)
    : 100;

  // Max water value for scaling chart
  const maxWaterVal = Math.max(waterSettings.dailyGoalMl, ...last7Days.map((d) => d.waterMl), 2000);

  return (
    <div className="space-y-6 pb-24 max-w-4xl mx-auto px-4 pt-4">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Geçmiş & İstatistikler</h2>
        <p className="text-xs text-slate-500 font-medium">
          Son 7 günlük su tüketiminiz, ilaç alma disiplininiz ve başarı seriniz
        </p>
      </div>

      {/* Highlights Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-amber-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Alışkanlık Serisi
            </span>
            <Flame className="w-5 h-5 fill-amber-500 text-amber-500" />
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-slate-900">{streakDays}</span>
            <span className="text-xs text-slate-500 font-bold ml-1">Gün</span>
          </div>
          <span className="text-[10px] text-amber-700 font-semibold mt-1">Harika bir ritim! 🔥</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-teal-600 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              İlaç Uyumu
            </span>
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-slate-900">%{overallAdherence}</span>
          </div>
          <span className="text-[10px] text-teal-700 font-semibold mt-1">Düzenli Kullanım</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-sky-600 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Toplam Su
            </span>
            <Droplets className="w-5 h-5" />
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-slate-900">
              {(totalWaterAllTime / 1000).toFixed(1)}
            </span>
            <span className="text-xs text-slate-500 font-bold ml-1">Litre</span>
          </div>
          <span className="text-[10px] text-sky-700 font-semibold mt-1">Hidrasyon Kaydı</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-600 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Alınan Doz
            </span>
            <Pill className="w-5 h-5" />
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-slate-900">
              {totalPillsTakenAllTime}
            </span>
            <span className="text-xs text-slate-500 font-bold ml-1">Doz</span>
          </div>
          <span className="text-[10px] text-emerald-700 font-semibold mt-1">Zamanında Alındı</span>
        </div>
      </div>

      {/* 7-Day Water Consumption Chart */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Son 7 Günlük Su Tüketimi (ml)</h3>
            <p className="text-xs text-slate-500">Hedef çizginiz: {waterSettings.dailyGoalMl} ml</p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-sky-700 font-bold bg-sky-50 px-3 py-1 rounded-xl border border-sky-200">
            <Droplets className="w-3.5 h-3.5 text-sky-600" />
            <span>ml Bazında</span>
          </div>
        </div>

        {/* Visual Bar Chart */}
        <div className="pt-6 pb-2">
          <div className="h-48 flex items-end justify-between gap-2 sm:gap-4 px-2 border-b border-slate-100 relative">
            {/* Target line */}
            <div
              className="absolute left-0 right-0 border-b-2 border-dashed border-sky-400/80 pointer-events-none z-10"
              style={{ bottom: `${(waterSettings.dailyGoalMl / maxWaterVal) * 100}%` }}
            >
              <span className="absolute right-0 -top-4 text-[10px] font-bold text-sky-800 bg-white/95 px-1 rounded-sm shadow-2xs">
                Hedef ({waterSettings.dailyGoalMl}ml)
              </span>
            </div>

            {last7Days.map((day) => {
              const heightPct = Math.min(100, Math.round((day.waterMl / maxWaterVal) * 100));
              const isGoalReached = day.waterMl >= day.waterGoal;

              return (
                <div key={day.dateStr} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  {/* Tooltip on hover */}
                  <span className="text-[10px] font-bold text-slate-700 opacity-0 group-hover:opacity-100 transition truncate">
                    {day.waterMl} ml
                  </span>

                  {/* Bar */}
                  <div className="w-full max-w-[38px] bg-slate-100 rounded-t-xl overflow-hidden flex flex-col justify-end h-full">
                    <div
                      className={`w-full rounded-t-xl transition-all duration-500 ${
                        isGoalReached
                          ? 'bg-gradient-to-t from-sky-600 to-cyan-400'
                          : 'bg-gradient-to-t from-slate-400 to-sky-300'
                      }`}
                      style={{ height: `${Math.max(6, heightPct)}%` }}
                    />
                  </div>

                  {/* Label */}
                  <div className="text-center">
                    <span className="block text-[11px] font-bold text-slate-800">{day.dayName}</span>
                    <span className="block text-[9px] text-slate-500">{day.dayNum}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 7-Day Adherence Breakdown Table */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-900 text-base">Günlük Detay Raporu</h3>

        <div className="divide-y divide-slate-100">
          {[...last7Days].reverse().map((day) => {
            const hasActivity = day.waterMl > 0 || day.dosesTaken > 0;

            return (
              <div key={day.dateStr} className="py-3 flex items-center justify-between">
                <div>
                  <span className="font-bold text-xs text-slate-900 block">
                    {day.dayName}, {day.dayNum}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {hasActivity ? 'Kayıt mevcut' : 'Kayıt bulunmuyor'}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {/* Water badge */}
                  <div className="text-right">
                    <span className="text-xs font-bold text-sky-700 block">
                      {day.waterMl} ml
                    </span>
                    <span className="text-[10px] text-slate-400">%{day.waterPct} su</span>
                  </div>

                  {/* Pills badge */}
                  <div className="text-right pl-2 border-l border-slate-100">
                    <span className="text-xs font-bold text-teal-700 block">
                      {day.dosesTaken} / {day.dosesTotal} Doz
                    </span>
                    <span className="text-[10px] text-slate-400">ilaç alındı</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
