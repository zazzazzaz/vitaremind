import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Droplets, 
  Plus, 
  Trash2, 
  Clock, 
  Calculator, 
  Volume2, 
  Sliders, 
  Check, 
  RotateCcw,
  Sparkles,
  Info
} from 'lucide-react';
import { playWaterDropSound } from '../services/soundService';

export const WaterTab: React.FC = () => {
  const {
    waterLogs,
    waterSettings,
    todayWaterTotal,
    todayWaterPercentage,
    addWater,
    removeWaterLog,
    updateWaterSettings,
    appSettings,
    testAlarm,
  } = useApp();

  const [customMl, setCustomMl] = useState<string>('');
  const [showCalculator, setShowCalculator] = useState(false);
  const [weightKg, setWeightKg] = useState<number>(75);
  const [isEditingSettings, setIsEditingSettings] = useState(false);

  // Local form state for settings
  const [goalMl, setGoalMl] = useState<number>(waterSettings.dailyGoalMl);
  const [intervalMins, setIntervalMins] = useState<number>(waterSettings.intervalMinutes);
  const [startH, setStartH] = useState<string>(waterSettings.startTime);
  const [endH, setEndH] = useState<string>(waterSettings.endTime);
  const [reminderEnabled, setReminderEnabled] = useState<boolean>(waterSettings.reminderEnabled);

  const handleCustomAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(customMl, 10);
    if (val > 0) {
      addWater(val);
      setCustomMl('');
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateWaterSettings({
      dailyGoalMl: Math.max(500, goalMl),
      intervalMinutes: Math.max(15, intervalMins),
      startTime: startH,
      endTime: endH,
      reminderEnabled,
    });
    setIsEditingSettings(false);
  };

  const calculateByWeight = () => {
    // Standard guideline: ~35ml per kg of body weight
    const recommended = Math.round((weightKg * 35) / 50) * 50;
    setGoalMl(recommended);
    updateWaterSettings({ dailyGoalMl: recommended });
    setShowCalculator(false);
  };

  // Filter today's logs and sort newest first
  const todayStr = new Date().toISOString().split('T')[0];
  const todayLogs = waterLogs
    .filter((l) => l.date === todayStr)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="space-y-6 pb-24 max-w-4xl mx-auto px-4 pt-4">
      {/* Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Su Takibi & Periyotları</h2>
          <p className="text-xs text-slate-500">
            Günlük hidrasyon hedefinizi ve kişiselleştirilmiş periyodik hatırlatıcılarınızı yönetin
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCalculator(!showCalculator)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
          >
            <Calculator className="w-3.5 h-3.5 text-sky-600" />
            <span>Hedef Hesapla</span>
          </button>

          <button
            onClick={() => setIsEditingSettings(!isEditingSettings)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 text-xs font-bold transition"
          >
            <Sliders className="w-3.5 h-3.5 text-sky-600" />
            <span>Periyot Ayarla</span>
          </button>
        </div>
      </div>

      {/* Target Calculator Modal / Dropdown */}
      {showCalculator && (
        <div className="bg-sky-50 border border-sky-200 rounded-3xl p-5 space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sky-950 text-sm flex items-center gap-2">
              <Calculator className="w-4 h-4 text-sky-600" />
              <span>İdeal Günlük Su İhtiyacı Hesaplayıcı</span>
            </h4>
            <button
              onClick={() => setShowCalculator(false)}
              className="text-xs text-sky-600 hover:text-sky-800 font-bold"
            >
              Kapat
            </button>
          </div>
          <p className="text-xs text-sky-800">
            Dünya Sağlık Örgütü (WHO) standartlarına göre günlük su ihtiyacı vücut ağırlığının her kilogramı için yaklaşık 35 ml'dir.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <label className="text-xs font-bold text-sky-900 shrink-0">Kilonuz (kg):</label>
              <input
                type="number"
                min="30"
                max="250"
                value={weightKg}
                onChange={(e) => setWeightKg(Number(e.target.value))}
                className="w-24 px-3 py-1.5 rounded-xl border border-sky-300 bg-white text-sm font-bold text-slate-800"
              />
            </div>
            <div className="text-xs font-bold text-sky-950">
              Önerilen:{' '}
              <span className="text-base text-sky-700 font-black">
                {Math.round((weightKg * 35) / 50) * 50} ml
              </span>
            </div>
            <button
              onClick={calculateByWeight}
              className="w-full sm:w-auto px-4 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-xs transition"
            >
              Bu Hedefi Uygula
            </button>
          </div>
        </div>
      )}

      {/* Reminder Interval & Active Hours Settings Drawer */}
      {isEditingSettings && (
        <form onSubmit={handleSaveSettings} className="bg-white rounded-3xl p-6 border border-sky-200 shadow-md space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Sliders className="w-4 h-4 text-sky-600" />
              <span>Su İçme Periyodu ve Hatırlatıcı Ayarları</span>
            </h3>
            <button
              type="button"
              onClick={() => setIsEditingSettings(false)}
              className="text-xs text-slate-400 hover:text-slate-600 font-bold"
            >
              İptal
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Reminder Toggle */}
            <div className="sm:col-span-2 flex items-center justify-between p-3.5 rounded-2xl bg-sky-50/60 border border-sky-100">
              <div>
                <span className="text-xs font-bold text-slate-800 block">
                  Periyodik Su Hatırlatıcı
                </span>
                <span className="text-[11px] text-slate-500">
                  Belirlenen aralıklarla sesli ve görsel bildirim gönderir
                </span>
              </div>
              <input
                type="checkbox"
                checked={reminderEnabled}
                onChange={(e) => setReminderEnabled(e.target.checked)}
                className="w-5 h-5 text-sky-600 rounded-md border-slate-300 focus:ring-sky-500"
              />
            </div>

            {/* Daily Goal */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Günlük Su Hedefi (ml)
              </label>
              <input
                type="number"
                step="50"
                min="500"
                max="10000"
                value={goalMl}
                onChange={(e) => setGoalMl(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold text-sm"
              />
            </div>

            {/* Interval Minutes */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Hatırlatma Aralığı
              </label>
              <select
                value={intervalMins}
                onChange={(e) => setIntervalMins(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-bold text-sm"
              >
                <option value={30}>Her 30 Dakikada Bir</option>
                <option value={45}>Her 45 Dakikada Bir</option>
                <option value={60}>Her 1 Saatte Bir</option>
                <option value={90}>Her 1.5 Saatte Bir</option>
                <option value={120}>Her 2 Saatte Bir</option>
                <option value={180}>Her 3 Saatte Bir</option>
              </select>
            </div>

            {/* Start & End Times */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Hatırlatıcı Başlangıç Saati (Uyanış)
              </label>
              <input
                type="time"
                value={startH}
                onChange={(e) => setStartH(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold text-sm"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Hatırlatıcı Bitiş Saati (Yatış)
              </label>
              <input
                type="time"
                value={endH}
                onChange={(e) => setEndH(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold text-sm"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-md transition"
            >
              Ayarları Kaydet
            </button>
          </div>
        </form>
      )}

      {/* Main Hydration Visual Vessel */}
      <div className="bg-gradient-to-b from-sky-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Left Info */}
          <div className="space-y-4 text-center md:text-left flex-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-sky-200 text-xs font-semibold">
              <Droplets className="w-3.5 h-3.5 text-sky-300" />
              <span>Günün Hidrasyon Durumu</span>
            </div>

            <div>
              <div className="flex items-baseline gap-2 justify-center md:justify-start">
                <span className="text-5xl sm:text-6xl font-black tracking-tight text-white">
                  {todayWaterTotal}
                </span>
                <span className="text-lg text-sky-300 font-bold">/ {waterSettings.dailyGoalMl} ml</span>
              </div>
              <p className="text-xs text-sky-200/80 mt-1">
                Hedefinize ulaşmak için{' '}
                <strong className="text-white">
                  {Math.max(0, waterSettings.dailyGoalMl - todayWaterTotal)} ml
                </strong>{' '}
                kaldı.
              </p>
            </div>

            {/* Reminder Schedule Badge */}
            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-xs space-y-1 inline-block">
              <div className="flex items-center gap-2 text-sky-200 font-bold">
                <Clock className="w-3.5 h-3.5 text-sky-400" />
                <span>
                  Periyot:{' '}
                  {waterSettings.reminderEnabled
                    ? `Her ${waterSettings.intervalMinutes} dk (${waterSettings.startTime} - ${waterSettings.endTime})`
                    : 'Hatırlatıcı Kapalı'}
                </span>
              </div>
              <p className="text-[11px] text-white/70">
                Gece uyurken alarm çalmaz, sadece aktif saatlerde hatırlatır.
              </p>
            </div>
          </div>

          {/* Center/Right Animated Circular Gauge & Wave Vessel */}
          <div className="relative w-44 h-44 sm:w-52 sm:h-52 rounded-full border-4 border-sky-400/30 p-2 flex items-center justify-center shrink-0">
            {/* Water Fill Capsule */}
            <div className="w-full h-full rounded-full overflow-hidden relative bg-slate-800/80 border border-sky-500/40 shadow-inner flex items-center justify-center">
              {/* Animated Liquid Waves */}
              <div
                className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-sky-600 via-sky-500 to-cyan-400 transition-all duration-700 ease-out"
                style={{ height: `${Math.min(100, todayWaterPercentage)}%` }}
              >
                {/* Surface shine */}
                <div className="absolute top-0 left-0 right-0 h-2 bg-white/40 blur-[1px]" />
              </div>

              {/* Central Text Content */}
              <div className="relative z-10 text-center drop-shadow-md">
                <span className="text-3xl sm:text-4xl font-black text-white">
                  %{todayWaterPercentage}
                </span>
                <span className="block text-[11px] font-bold text-sky-100 uppercase tracking-wider">
                  Tamamlandı
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Add Water Section */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-base">Hızlı Su Ekle</h3>
          <button
            onClick={() => playWaterDropSound(appSettings.soundVolume)}
            title="Sesi Dinle"
            className="text-xs text-sky-600 font-bold hover:text-sky-800 flex items-center gap-1"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Su Sesi</span>
          </button>
        </div>

        {/* Preset Cup Sizes */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { ml: 150, label: 'Küçük Bardak' },
            { ml: 200, label: 'Klasik Bardak' },
            { ml: 250, label: 'Kupa Bardak' },
            { ml: 330, label: 'Küçük Şişe' },
            { ml: 500, label: 'Yarım Litre Matara' },
          ].map((cup) => (
            <button
              key={cup.ml}
              onClick={() => addWater(cup.ml)}
              className="p-3 rounded-2xl bg-sky-50/70 hover:bg-sky-100 border border-sky-100 hover:border-sky-300 text-slate-800 active:scale-95 transition flex flex-col items-center justify-center gap-1.5 shadow-xs group"
            >
              <div className="w-8 h-8 rounded-full bg-sky-500/10 text-sky-600 flex items-center justify-center group-hover:scale-110 transition">
                <Droplets className="w-4 h-4 fill-sky-500/20" />
              </div>
              <span className="font-black text-sm text-sky-900">+{cup.ml} ml</span>
              <span className="text-[10px] text-slate-500 font-medium">{cup.label}</span>
            </button>
          ))}
        </div>

        {/* Custom Amount Form */}
        <form onSubmit={handleCustomAdd} className="pt-2 flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="number"
              placeholder="Özel miktar girin (ml)..."
              value={customMl}
              onChange={(e) => setCustomMl(e.target.value)}
              min="10"
              max="3000"
              className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs font-semibold outline-hidden focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">
              ml
            </span>
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-2xl font-bold text-xs shadow-xs active:scale-95 transition"
          >
            Ekle
          </button>
        </form>
      </div>

      {/* Today's Log Timeline */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-base">Bugünkü İçilen Sular</h3>
          <span className="text-xs font-semibold text-slate-500">
            Toplam {todayLogs.length} kayıt
          </span>
        </div>

        {todayLogs.length === 0 ? (
          <div className="p-6 text-center text-slate-400 text-xs">
            Bugün henüz su kaydı girilmedi. Yukarıdaki butonlardan ekleyebilirsiniz!
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {todayLogs.map((log) => {
              const timeStr = new Date(log.timestamp).toLocaleTimeString('tr-TR', {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div key={log.id} className="py-3 flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center font-bold text-xs">
                      💧
                    </div>
                    <div>
                      <span className="text-sm font-bold text-slate-800">+{log.amountMl} ml</span>
                      <span className="text-xs text-slate-400 ml-2">{timeStr}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => removeWaterLog(log.id)}
                    title="Bu kaydı sil"
                    className="p-1.5 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
