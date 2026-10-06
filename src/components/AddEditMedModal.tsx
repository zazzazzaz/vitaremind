import React, { useState } from 'react';
import { Medication, MedicationColor, MedicationForm, MealTiming } from '../types';
import { useApp } from '../context/AppContext';
import { X, Plus, Trash2, Clock, Pill, PackageCheck, AlertCircle, Camera, Sparkles, Loader2 } from 'lucide-react';

interface AddEditMedModalProps {
  initialMed?: Medication | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (medData: Omit<Medication, 'id' | 'createdAt'>) => void;
  onDelete?: (id: string) => void;
}

const colorOptions: { id: MedicationColor; label: string; bg: string; border: string }[] = [
  { id: 'emerald', label: 'Zümrüt', bg: 'bg-emerald-500', border: 'border-emerald-600' },
  { id: 'teal', label: 'Teal', bg: 'bg-teal-500', border: 'border-teal-600' },
  { id: 'sky', label: 'Mavi', bg: 'bg-sky-500', border: 'border-sky-600' },
  { id: 'indigo', label: 'İndigo', bg: 'bg-indigo-500', border: 'border-indigo-600' },
  { id: 'violet', label: 'Mor', bg: 'bg-purple-500', border: 'border-purple-600' },
  { id: 'amber', label: 'Amber', bg: 'bg-amber-500', border: 'border-amber-600' },
  { id: 'rose', label: 'Mercan', bg: 'bg-rose-500', border: 'border-rose-600' },
];

const formOptions: { id: MedicationForm; label: string }[] = [
  { id: 'tablet', label: 'Tablet / Hap' },
  { id: 'capsule', label: 'Kapsül' },
  { id: 'syrup', label: 'Şurup / Sıvı' },
  { id: 'drop', label: 'Damla' },
  { id: 'spray', label: 'Sprey' },
  { id: 'injection', label: 'İğne' },
  { id: 'inhaler', label: 'İnhaler' },
  { id: 'cream', label: 'Krem / Merhem' },
  { id: 'other', label: 'Diğer' },
];

const daysMap = [
  { day: 1, label: 'Pzt' },
  { day: 2, label: 'Sal' },
  { day: 3, label: 'Çar' },
  { day: 4, label: 'Per' },
  { day: 5, label: 'Cum' },
  { day: 6, label: 'Cmt' },
  { day: 0, label: 'Paz' },
];

export const AddEditMedModal: React.FC<AddEditMedModalProps> = ({
  initialMed,
  isOpen,
  onClose,
  onSave,
  onDelete,
}) => {
  const { appSettings } = useApp();
  const [name, setName] = useState(initialMed?.name || '');
  const [dosage, setDosage] = useState(initialMed?.dosage || '1 Tablet');
  const [form, setForm] = useState<MedicationForm>(initialMed?.form || 'tablet');
  const [color, setColor] = useState<MedicationColor>(initialMed?.color || 'emerald');
  const [times, setTimes] = useState<string[]>(initialMed?.times?.length ? initialMed.times : ['09:00']);
  const [selectedDays, setSelectedDays] = useState<number[]>(initialMed?.daysOfWeek || []);
  const [instructions, setInstructions] = useState<MealTiming>(initialMed?.instructions || 'after_meal');
  const [stockEnabled, setStockEnabled] = useState(initialMed ? initialMed.stockEnabled : true);
  const [stockCount, setStockCount] = useState<number>(initialMed ? initialMed.stockCount : 30);
  const [stockAlertThreshold, setStockAlertThreshold] = useState<number>(
    initialMed ? initialMed.stockAlertThreshold : 5
  );
  const [notes, setNotes] = useState(initialMed?.notes || '');
  const [error, setError] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanSuccessMsg, setScanSuccessMsg] = useState('');
  const cameraInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleImageCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    setError('');
    setScanSuccessMsg('');

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64Data = event.target?.result as string;
        if (!base64Data) {
          setIsScanning(false);
          return;
        }

        try {
          const response = await fetch('/api/ai/scan-medication', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              imageBase64: base64Data,
              mimeType: file.type || 'image/jpeg',
              userApiKey: appSettings.geminiApiKey || undefined,
            }),
          });

          const result = await response.json();
          if (!response.ok || !result.success) {
            throw new Error(result.error || 'İlaç görseli okunamadı.');
          }

          const { data } = result;
          if (data.name) setName(data.name);
          if (data.dosage) setDosage(data.dosage);
          if (data.form && formOptions.some((f) => f.id === data.form)) {
            setForm(data.form);
          }
          if (data.instructions) {
            setInstructions(data.instructions);
          }
          if (data.stockCount && Number(data.stockCount) > 0) {
            setStockEnabled(true);
            setStockCount(Number(data.stockCount));
          }
          if (data.notes) {
            setNotes((prev) => (prev ? `${prev} • ${data.notes}` : data.notes));
          }

          setScanSuccessMsg('Yapay zeka ilaç bilgilerini başarıyla okudu ve forma aktardı!');
          setTimeout(() => setScanSuccessMsg(''), 5000);
        } catch (fetchErr: any) {
          setError(fetchErr.message || 'Yapay zeka taraması sırasında hata oluştu.');
        } finally {
          setIsScanning(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setError('Görsel yüklenirken bir sorun oluştu.');
      setIsScanning(false);
    }

    if (cameraInputRef.current) {
      cameraInputRef.current.value = '';
    }
  };

  if (!isOpen) return null;

  const handleAddTime = () => {
    setTimes((prev) => [...prev, '12:00']);
  };

  const handleRemoveTime = (index: number) => {
    if (times.length <= 1) return;
    setTimes((prev) => prev.filter((_, i) => i !== index));
  };

  const handleTimeChange = (index: number, val: string) => {
    setTimes((prev) => {
      const copy = [...prev];
      copy[index] = val;
      return copy;
    });
  };

  const toggleDay = (day: number) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Lütfen bir ilaç veya vitamin adı giriniz.');
      return;
    }
    if (times.length === 0) {
      setError('En az bir hatırlatma saati seçmelisiniz.');
      return;
    }

    onSave({
      name: name.trim(),
      dosage: dosage.trim() || '1 Adet',
      form,
      color,
      times: times.sort(),
      daysOfWeek: selectedDays.length === 7 ? [] : selectedDays,
      instructions,
      stockEnabled,
      stockCount: stockEnabled ? Math.max(0, Number(stockCount)) : 0,
      stockAlertThreshold: stockEnabled ? Math.max(1, Number(stockAlertThreshold)) : 5,
      notes: notes.trim(),
      active: initialMed ? initialMed.active : true,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-50 dark:bg-slate-800 text-teal-600 dark:text-teal-400">
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-lg">
                {initialMed ? 'İlacı Düzenle' : 'Yeni İlaç / Vitamin Ekle'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Hatırlatma saatleri ve doz detayları</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-5 flex-1">
          {/* AI Medication Vision Card */}
          <div className="bg-gradient-to-r from-teal-500/10 via-cyan-500/10 to-emerald-500/10 dark:from-teal-950/40 dark:via-cyan-950/40 dark:to-emerald-950/40 border border-teal-200/90 dark:border-teal-800/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                {isScanning ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Camera className="w-5 h-5" />
                )}
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>Yapay Zeka ile İlacı Tara</span>
                  <span className="text-[10px] font-extrabold px-1.5 py-0.2 bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-300 rounded-md">
                    Otomatik
                  </span>
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  İlaç kutusunun veya prospektüsünün fotoğrafını yükleyin, bilgileri otomatik doldursun.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <input
                type="file"
                ref={cameraInputRef}
                accept="image/*"
                capture="environment"
                onChange={handleImageCapture}
                className="hidden"
                id="med-camera-input"
              />
              <label
                htmlFor="med-camera-input"
                className={`cursor-pointer px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs ${
                  isScanning
                    ? 'bg-slate-300 text-slate-600 cursor-not-allowed'
                    : 'bg-teal-600 hover:bg-teal-700 text-white active:scale-95'
                }`}
              >
                {isScanning ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Okunuyor...</span>
                  </>
                ) : (
                  <>
                    <Camera className="w-3.5 h-3.5" />
                    <span>Fotoğraf Çek / Yükle</span>
                  </>
                )}
              </label>
            </div>
          </div>

          {scanSuccessMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{scanSuccessMsg}</span>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Name & Dosage */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                İlaç veya Vitamin Adı *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError('');
                }}
                placeholder="Örn: Nexium, B12, Parol, Magnezyum"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 text-sm font-medium outline-hidden transition placeholder:text-slate-400 dark:placeholder:text-slate-500"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Doz / Miktar
              </label>
              <input
                type="text"
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                placeholder="Örn: 1 Tablet, 500mg"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 text-sm font-medium outline-hidden transition placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
            </div>
          </div>

          {/* Form & Color */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                İlaç Türü
              </label>
              <select
                value={form}
                onChange={(e) => setForm(e.target.value as MedicationForm)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 text-sm font-medium outline-hidden transition"
              >
                {formOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Renk Etiketi
              </label>
              <div className="flex items-center gap-2 pt-1 flex-wrap">
                {colorOptions.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setColor(c.id)}
                    className={`w-7 h-7 rounded-full ${c.bg} transition-transform ${
                      color === c.id ? 'ring-3 ring-slate-900 dark:ring-teal-400 ring-offset-2 dark:ring-offset-slate-900 scale-110' : 'opacity-80 hover:opacity-100'
                    }`}
                    title={c.label}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Instructions (Meal timing) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Kullanım Şekli
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'before_meal', label: 'Aç Karnına' },
                { id: 'after_meal', label: 'Tok Karnına' },
                { id: 'with_meal', label: 'Yemekle Birlikte' },
                { id: 'anytime', label: 'Fark Etmez' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setInstructions(item.id as MealTiming)}
                  className={`py-2 px-2.5 rounded-xl border text-xs font-semibold text-center transition ${
                    instructions === item.id
                      ? 'bg-teal-50 dark:bg-slate-800 border-teal-500 text-teal-800 dark:text-teal-300'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Hatırlatma Saatleri */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                <span>Hatırlatma Saatleri</span>
              </label>
              <button
                type="button"
                onClick={handleAddTime}
                className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:text-teal-700 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Saat Ekle</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {times.map((time, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl px-2.5 py-1.5 border border-slate-200 dark:border-slate-700"
                >
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => handleTimeChange(idx, e.target.value)}
                    className="bg-transparent text-sm font-bold text-slate-800 dark:text-white outline-hidden"
                  />
                  {times.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveTime(idx)}
                      className="p-1 text-slate-400 hover:text-rose-500"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Gün Seçimi */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Hangi Günler?
              </label>
              <button
                type="button"
                onClick={() => setSelectedDays(selectedDays.length === 7 ? [] : [1, 2, 3, 4, 5, 6, 0])}
                className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:text-teal-700"
              >
                {selectedDays.length === 0 || selectedDays.length === 7 ? 'Her Gün' : 'Tümünü Seç'}
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1">
              {daysMap.map((d) => {
                const isSelected = selectedDays.length === 0 || selectedDays.includes(d.day);
                return (
                  <button
                    key={d.day}
                    type="button"
                    onClick={() => toggleDay(d.day)}
                    className={`py-2 rounded-xl text-xs font-bold transition ${
                      isSelected
                        ? 'bg-teal-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {d.label}
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              {selectedDays.length === 0 || selectedDays.length === 7
                ? 'Haftanın her günü hatırlatılacak'
                : `Seçilen ${selectedDays.length} gün hatırlatılacak`}
            </p>
          </div>

          {/* Stok / Kutu Takibi */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PackageCheck className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  Kutu & Stok Takibi
                </span>
              </div>
              <input
                type="checkbox"
                checked={stockEnabled}
                onChange={(e) => setStockEnabled(e.target.checked)}
                className="w-4 h-4 text-teal-600 rounded-md border-slate-300 dark:border-slate-700 focus:ring-teal-500"
              />
            </div>

            {stockEnabled && (
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                    Kutudaki Kalan Sayı
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={stockCount}
                    onChange={(e) => setStockCount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                    Uyarı Eşiği (Kaç kalınca uyarsın?)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={stockAlertThreshold}
                    onChange={(e) => setStockAlertThreshold(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-bold"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Notlar */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Kişisel Notlar & Hatırlatma Notu
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Örn: Bol su ile için, süt ve greyfurt suyu ile almayın."
              rows={2}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 text-xs font-medium outline-hidden placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
          </div>

          {/* Delete Action if editing */}
          {initialMed && onDelete && (
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  if (confirm(`${initialMed.name} ilacını silmek istediğinize emin misiniz?`)) {
                    onDelete(initialMed.id);
                    onClose();
                  }
                }}
                className="w-full py-2.5 px-3 rounded-xl border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-bold flex items-center justify-center gap-1.5 transition"
              >
                <Trash2 className="w-4 h-4" />
                <span>Bu İlacı Tamamen Sil</span>
              </button>
            </div>
          )}

          {/* Submit */}
          <div className="pt-3">
            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-[0.99] text-white font-bold text-sm shadow-md shadow-teal-600/20 transition"
            >
              {initialMed ? 'Değişiklikleri Kaydet' : 'İlacı Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};