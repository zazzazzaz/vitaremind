import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Droplets, 
  Plus, 
  Trash2, 
  Clock, 
  Calculator, 
  Sliders, 
  RotateCcw,
  Sparkles
} from 'lucide-react';

export const WaterTab: React.FC = () => {
  const {
    waterLogs,
    waterSettings,
    todayWaterTotal,
    todayWaterPercentage,
    addWater,
    undoLastWaterLog,
    removeWaterLog,
    updateWaterSettings,
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
                className="w-24 px-3 py-1.5 rounded-xl border border-sky-300 bg-white text-sm font-bold text-slate-900"
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
            <div className="sm:col-span-2 flex items-center justify-between p-3.5 rounded-2xl bg-sky-50 border border-sky-100">
              <div>
                <span className="text-xs font-bold text-slate-900 block">
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
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-bold text-sm focus:border-sky-500 outline-hidden"
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
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-bold text-sm focus:border-sky-500 outline-hidden"
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
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-bold text-sm focus:border-sky-500 outline-hidden"
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
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-bold text-sm focus:border-sky-500 outline-hidden"
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

      {/* Main Hydration Dashboard */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Animated Water Fill Gauge */}
          <div className="relative w-44 h-44 rounded-full border-4 border-sky-100 flex items-center justify-center overflow-hidden bg-sky-50/40 shadow-inner">
            {/* Water Wave Effect */}
            <div
              className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-sky-500 to-cyan-400 transition-all duration-700 ease-out opacity-85"
              style={{ height: `${Math.min(100, todayWaterPercentage)}%` }}
            />

            {/* Inner Stats Text */}
            <div className="relative z-10 text-center p-2">
              <span className="text-3xl font-black text-slate-900 tracking-tight block">
                %{todayWaterPercentage}
              </span>
              <span className="text-xs font-bold text-slate-700 block mt-0.5">
                {todayWaterTotal} / {waterSettings.dailyGoalMl} ml
              </span>
              <span className="text-[10px] text-slate-500 font-medium block">
                {todayWaterTotal >= waterSettings.dailyGoalMl
                  ? 'Hedef Tamamlandı! 🎉'
                  : `${waterSettings.dailyGoalMl - todayWaterTotal} ml kaldı`}
              </span>
            </div>
          </div>

          {/* Quick Preset Buttons & Undo */}
          <div className="flex-1 w-full space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Hızlı Ekle (Bardak & Şişe)
              </span>
              {todayLogs.length > 0 && (
                <button
                  type="button"
                  onClick={undoLastWaterLog}
                  className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 transition"
                  title="Son su girişini geri al"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Son Eklemeyi Geri Al</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {[
                { label: 'Küçük Bardak', amount: 150 },
                { label: 'Su Bardağı', amount: 200 },
                { label: 'Kupa / Kadeh', amount: 250 },
                { label: 'Büyük Bardak', amount: 330 },
                { label: 'Küçük Şişe', amount: 500 },
                { label: 'Büyük Şişe', amount: 750 },
              ].map((item) => (
                <button
                  key={item.amount}
                  onClick={() => addWater(item.amount)}
                  className="p-3 rounded-2xl bg-slate-50 hover:bg-sky-50 border border-slate-200/80 hover:border-sky-300 text-left transition active:scale-95 group shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 group-hover:text-sky-900">
                      {item.label}
                    </span>
                    <Plus className="w-3.5 h-3.5 text-sky-500" />
                  </div>
                  <span className="text-[11px] text-sky-700 font-extrabold mt-0.5 block">
                    +{item.amount} ml
                  </span>
                </button>
              ))}
            </div>

            {/* Custom Input */}
            <form onSubmit={handleCustomAdd} className="flex gap-2 pt-1">
              <input
                type="number"
                placeholder="Örn: 400 ml"
                min="10"
                max="3000"
                value={customMl}
                onChange={(e) => setCustomMl(e.target.value)}
                className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs font-bold focus:border-sky-500 outline-hidden placeholder:text-slate-400"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-xs transition"
              >
                Ekle
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Today's Water Drink Log */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <Clock className="w-4 h-4 text-sky-600" />
            <span>Bugünkü Su İçme Kayıtları</span>
          </h3>
          <span className="text-xs text-slate-500 font-semibold">{todayLogs.length} kayıt</span>
        </div>

        {todayLogs.length === 0 ? (
          <div className="text-center py-6 text-slate-400 text-xs">
            Bugün henüz su kaydı girilmedi. Yukarıdaki butonlardan içtiğiniz suyu kaydedin!
          </div>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {todayLogs.map((log) => {
              const timeStr = new Date(log.timestamp).toLocaleTimeString('tr-TR', {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center font-bold text-xs">
                      💧
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">
                        +{log.amountMl} ml Su İçildi
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">Saat {timeStr}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => removeWaterLog(log.id)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                    title="Bu kaydı sil"
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
