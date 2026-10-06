import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  BarChart3, 
  Flame, 
  CheckCircle, 
  Droplets, 
  Pill, 
  Trophy, 
  Calendar,
  TrendingUp,
  Award,
  Share2,
  FileText,
  Printer
} from 'lucide-react';

export const HistoryTab: React.FC = () => {
  const { doseLogs, waterLogs, medications, waterSettings } = useApp();
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

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
      dosesTaken: dayDosesTaken,
      dosesTotal: dayDosesTotal,
    };
  });

  // Calculate streak
  const calculateStreak = () => {
    let streak = 0;
    for (let i = 0; i < 30; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const hasDoses = doseLogs.some((l) => l.date === dateStr && l.status === 'taken');
      const hasWater = waterLogs.some((w) => w.date === dateStr && w.amountMl > 0);

      if (hasDoses || hasWater) {
        streak++;
      } else if (i > 0) {
        break; // Streak broken
      }
    }
    return streak;
  };

  const streakDays = calculateStreak();

  // Calculate total statistics
  const totalWaterAllTime = waterLogs.reduce((sum, item) => sum + item.amountMl, 0);
  const totalTakenDoses = doseLogs.filter((l) => l.status === 'taken').length;
  const totalSnoozedDoses = doseLogs.filter((l) => l.status === 'snoozed').length;
  const totalMissedDoses = doseLogs.filter((l) => l.status === 'missed').length;

  const totalLogs = totalTakenDoses + totalSnoozedDoses + totalMissedDoses;
  const overallAdherence = totalLogs > 0 ? Math.round((totalTakenDoses / totalLogs) * 100) : 100;

  const reportSummaryText = `*VitaRemind 7 Günlük Sağlık & İlaç Raporu*\n` +
    `📅 Tarih: ${new Date().toLocaleDateString('tr-TR')}\n` +
    `📊 İlaç Kullanım Uyumu: %${overallAdherence}\n` +
    `💧 Toplam Su Tüketimi: ${(totalWaterAllTime / 1000).toFixed(1)} Litre\n` +
    `🔥 Alışkanlık Serisi: ${streakDays} Gün\n\n` +
    `*Son 7 Günlük Doz Detayı:*\n` +
    last7Days.map(d => `• ${d.dayName} (${d.dayNum}): ${d.dosesTaken} Doz İlaç, ${d.waterMl} ml Su`).join('\n') +
    `\n\n_VitaRemind İlaç ve Su Hatırlatıcı ile oluşturuldu._`;

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Geçmiş & Başarılar</h2>
          <p className="text-xs text-slate-500 font-medium">Sağlık alışkanlıklarınız ve istatistikleriniz</p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold shadow-xs">
          <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
          <span>{streakDays} Günlük Seri!</span>
        </div>
      </div>

      {/* Summary KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col items-center text-center">
          <div className="p-2 bg-teal-50 text-teal-600 rounded-2xl mb-2">
            <Trophy className="w-5 h-5" />
          </div>
          <span className="text-2xl font-black text-slate-900">{overallAdherence}%</span>
          <span className="text-[11px] text-slate-500 font-medium">İlaç Uyum Oranı</span>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col items-center text-center">
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-2xl mb-2">
            <CheckCircle className="w-5 h-5" />
          </div>
          <span className="text-2xl font-black text-slate-900">{totalTakenDoses}</span>
          <span className="text-[11px] text-slate-500 font-medium">Tamamlanan Doz</span>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col items-center text-center">
          <div className="p-2 bg-sky-50 text-sky-600 rounded-2xl mb-2">
            <Droplets className="w-5 h-5" />
          </div>
          <span className="text-2xl font-black text-slate-900">
            {(totalWaterAllTime / 1000).toFixed(1)} L
          </span>
          <span className="text-[11px] text-slate-500 font-medium">İçilen Toplam Su</span>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col items-center text-center">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-2xl mb-2">
            <Pill className="w-5 h-5" />
          </div>
          <span className="text-2xl font-black text-slate-900">{medications.length}</span>
          <span className="text-[11px] text-slate-500 font-medium">Aktif İlaç Sayısı</span>
        </div>
      </div>

      {/* Last 7 Days Water & Medication Bar Charts */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-sky-50 text-sky-600 rounded-xl">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Son 7 Günlük Su Tüketimi (ml)</h3>
          </div>
          <span className="text-xs text-slate-400 font-medium">Haftalık Grafik</span>
        </div>

        {/* Water Chart */}
        <div className="h-36 pt-4 flex items-end justify-between gap-2 border-b border-slate-100 pb-2 relative">
          {/* Goal Line */}
          <div
            className="absolute left-0 right-0 border-b border-dashed border-sky-300/80 z-10 flex items-center justify-end px-1"
            style={{ bottom: '70%' }}
          >
            <span className="text-[9px] font-bold text-sky-600 bg-sky-50 px-1.5 py-0.5 rounded-full">
              Hedef ({waterSettings.dailyGoalMl}ml)
            </span>
          </div>

          {last7Days.map((day, idx) => {
            const maxVal = Math.max(waterSettings.dailyGoalMl, 2500);
            const heightPct = Math.min(100, Math.round((day.waterMl / maxVal) * 100));

            return (
              <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group">
                <div className="w-full max-w-[28px] bg-slate-100 rounded-2xl h-full flex items-end overflow-hidden p-0.5 relative">
                  <div
                    className={`w-full rounded-xl transition-all duration-500 ${
                      day.waterMl >= waterSettings.dailyGoalMl
                        ? 'bg-gradient-to-t from-sky-600 to-cyan-400'
                        : 'bg-sky-300'
                    }`}
                    style={{ height: `${Math.max(8, heightPct)}%` }}
                  />
                </div>
                {/* Label */}
                <div className="text-center mt-2">
                  <span className="block text-[11px] font-bold text-slate-700">{day.dayName}</span>
                  <span className="block text-[9px] text-slate-400">{day.dayNum}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Doctor / Family PDF & Text Report Export */}
      <div className="bg-gradient-to-br from-teal-900 to-slate-900 text-white rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-teal-500/20 text-teal-400 rounded-2xl border border-teal-500/30">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Doktor & Aile Sağlık Özeti Raporu</h3>
              <p className="text-xs text-slate-300">Haftalık ilaç uyumu ve su tüketim tablosunu görüntüleyin ve paylaşın</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={() => setIsReportModalOpen(true)}
            className="flex-1 py-3 px-4 rounded-xl bg-white/10 hover:bg-white/20 active:scale-98 border border-white/10 text-white font-bold text-xs flex items-center justify-center gap-2 transition"
          >
            <Printer className="w-4 h-4 text-teal-400" />
            <span>Sağlık Raporunu İncele & Yazdır</span>
          </button>

          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: 'VitaRemind Sağlık Raporum',
                  text: reportSummaryText,
                }).catch(() => {});
              } else {
                navigator.clipboard.writeText(reportSummaryText);
                alert('Sağlık özetiniz panoya kopyalandı!');
              }
            }}
            className="flex-1 py-3 px-4 rounded-xl bg-teal-500 hover:bg-teal-600 active:scale-98 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-md shadow-teal-500/20"
          >
            <Share2 className="w-4 h-4" />
            <span>WhatsApp / Mesaj İle Paylaş</span>
          </button>
        </div>
      </div>

      {/* In-App Report View Modal */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white text-slate-900 rounded-3xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-teal-400" />
                <h3 className="font-bold text-base">Haftalık Sağlık Raporu</h3>
              </div>
              <button
                onClick={() => setIsReportModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition font-bold"
              >
                ✕
              </button>
            </div>

            {/* Modal Body - Report Content */}
            <div className="p-6 overflow-y-auto space-y-5 text-slate-800">
              <div className="bg-teal-50 border border-teal-200/80 rounded-2xl p-4 space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-teal-900">
                  <span>Tarih: {new Date().toLocaleDateString('tr-TR')}</span>
                  <span className="bg-teal-600 text-white px-2 py-0.5 rounded-full text-[10px]">VitaRemind</span>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-2 text-center">
                  <div className="bg-white p-2.5 rounded-xl border border-teal-100">
                    <span className="block text-[10px] text-slate-500 font-semibold">Uyum</span>
                    <span className="text-sm font-black text-teal-700">%{overallAdherence}</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-teal-100">
                    <span className="block text-[10px] text-slate-500 font-semibold">Toplam Su</span>
                    <span className="text-sm font-black text-sky-600">{(totalWaterAllTime / 1000).toFixed(1)} L</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-teal-100">
                    <span className="block text-[10px] text-slate-500 font-semibold">Seri</span>
                    <span className="text-sm font-black text-amber-600">{streakDays} Gün</span>
                  </div>
                </div>
              </div>

              {/* 7 Day Table */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Son 7 Günlük Doz ve Su Takibi</h4>
                <div className="border border-slate-200 rounded-2xl overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-3">Gün</th>
                        <th className="p-3 text-center">İlaç Dozu</th>
                        <th className="p-3 text-right">Su Miktarı</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {last7Days.map((d, i) => (
                        <tr key={i} className="hover:bg-slate-50/80">
                          <td className="p-3 font-semibold text-slate-900">{d.dayName} ({d.dayNum})</td>
                          <td className="p-3 text-center font-bold text-teal-700">{d.dosesTaken} Doz</td>
                          <td className="p-3 text-right font-medium text-sky-600">{d.waterMl} ml</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(reportSummaryText);
                  alert('Rapor panoya kopyalandı!');
                }}
                className="flex-1 py-2.5 px-3 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs transition"
              >
                Panoya Kopyala
              </button>
              <button
                onClick={() => setIsReportModalOpen(false)}
                className="py-2.5 px-5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition"
              >
                Tamam / Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
