import React, { useState, useRef } from 'react';
import { Medication, MedicationColor, MedicationForm, MealTiming } from '../types';
import { useApp } from '../context/AppContext';
import { 
  X, 
  Plus, 
  Trash2, 
  Clock, 
  Pill, 
  PackageCheck, 
  AlertCircle, 
  Camera, 
  Sparkles, 
  Loader2, 
  Search, 
  Check, 
  ArrowRight,
  Info
} from 'lucide-react';
import { searchMedicationVariants, MedicationVariant } from '../services/aiMedicationService';

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

const commonSuggestions = ['Coraspin', 'Parol', 'Nexium', 'Augmentin', 'Lansor', 'Euthyrox', 'Benexol'];

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

  // AI Assistant States
  const [aiMode, setAiMode] = useState<'search' | 'scan'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<MedicationVariant[]>([]);
  const [selectedVariantName, setSelectedVariantName] = useState<string | null>(null);

  // Vision scanner states
  const [isScanning, setIsScanning] = useState(false);
  const [scanSuccessMsg, setScanSuccessMsg] = useState('');
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  // Sync form when initialMed changes
  React.useEffect(() => {
    if (initialMed) {
      setName(initialMed.name);
      setDosage(initialMed.dosage);
      setForm(initialMed.form);
      setColor(initialMed.color);
      setTimes(initialMed.times);
      setSelectedDays(initialMed.daysOfWeek || []);
      setInstructions(initialMed.instructions);
      setStockEnabled(initialMed.stockEnabled);
      setStockCount(initialMed.stockCount);
      setStockAlertThreshold(initialMed.stockAlertThreshold);
      setNotes(initialMed.notes || '');
    } else {
      setName('');
      setDosage('1 Tablet');
      setForm('tablet');
      setColor('emerald');
      setTimes(['09:00']);
      setSelectedDays([]);
      setInstructions('after_meal');
      setStockEnabled(true);
      setStockCount(30);
      setStockAlertThreshold(5);
      setNotes('');
      setSearchResults([]);
      setSelectedVariantName(null);
      setSearchQuery('');
    }
    setError('');
    setScanSuccessMsg('');
  }, [initialMed, isOpen]);

  if (!isOpen) return null;

  // Handle AI Drug Search
  const handlePerformSearch = async (termToSearch?: string) => {
    const q = (termToSearch || searchQuery).trim();
    if (!q) {
      setError('Lütfen aramak istediğiniz ilacın adını giriniz.');
      return;
    }

    setIsSearching(true);
    setError('');
    setScanSuccessMsg('');
    setSelectedVariantName(null);

    try {
      const results = await searchMedicationVariants(q, appSettings.geminiApiKey);
      if (results && results.length > 0) {
        setSearchResults(results);
      } else {
        setError(`"${q}" için sonuç bulunamadı. Lütfen ilacın adını kontrol ediniz.`);
      }
    } catch (err: any) {
      setError(err.message || 'İlaç aranırken bir hata oluştu.');
    } finally {
      setIsSearching(false);
    }
  };

  // Select variant and auto-populate all fields
  const handleSelectVariant = (variant: MedicationVariant) => {
    // Extract base drug name (e.g., "Coraspin 100 mg Enterik Kaplı Tablet" -> extract "Coraspin" or use name)
    const baseName = variant.name.split(' ')[0] || variant.name;
    setName(baseName);
    setDosage(variant.dosage);
    if (variant.form && formOptions.some((f) => f.id === variant.form)) {
      setForm(variant.form);
    }
    if (variant.instructions) {
      setInstructions(variant.instructions);
    }
    if (variant.stockCount) {
      setStockEnabled(true);
      setStockCount(variant.stockCount);
    }
    if (variant.notes) {
      setNotes(variant.notes);
    }

    setSelectedVariantName(variant.name);
    setScanSuccessMsg(`✓ ${variant.name} seçildi! Dozaj, kullanım şekli ve açıklamalar otomatik dolduruldu.`);
    setTimeout(() => setScanSuccessMsg(''), 7000);
  };

  // Handle Photo Scan
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
            throw new Error(result.error || 'İlaç kutusu okunamadı.');
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

          setScanSuccessMsg('✓ Yapay zeka ilaç kutusunu başarıyla tanıdı ve forma aktardı!');
          setTimeout(() => setScanSuccessMsg(''), 6000);
        } catch (fetchErr: any) {
          setError(fetchErr.message || 'Görsel işlenirken bir sorun oluştu.');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200/90 max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-50 text-teal-600">
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg">
                {initialMed ? 'İlacı Düzenle' : 'Yeni İlaç / Vitamin Ekle'}
              </h3>
              <p className="text-xs text-slate-500 font-medium">Hatırlatma saatleri ve doz detayları</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-5 flex-1 bg-white">
          {/* AI Smart Assistant Box */}
          <div className="rounded-2xl border border-teal-200 bg-gradient-to-br from-teal-50/80 via-emerald-50/40 to-teal-50/50 p-4 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-teal-600 text-white shadow-xs">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-teal-950 uppercase tracking-wider flex items-center gap-1.5">
                    <span>Yapay Zeka ile Otomatik İlaç Doldurma</span>
                    <span className="text-[10px] font-black px-1.5 py-0.2 bg-teal-200/80 text-teal-900 rounded-md">
                      Akıllı
                    </span>
                  </h4>
                  <p className="text-[11px] text-teal-800/80">
                    İlacın adını yazın veya kutusunu fotoğraflayın; yapay zeka tüm varyantları ve kullanım talimatlarını getirsin.
                  </p>
                </div>
              </div>
            </div>

            {/* AI Mode Selector Tabs */}
            <div className="flex rounded-xl bg-teal-100/70 p-1 gap-1">
              <button
                type="button"
                onClick={() => setAiMode('search')}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  aiMode === 'search'
                    ? 'bg-white text-teal-900 shadow-xs'
                    : 'text-teal-800 hover:text-teal-950'
                }`}
              >
                <Search className="w-3.5 h-3.5 text-teal-600" />
                <span>İsimle Ara (Örn: Coraspin)</span>
              </button>

              <button
                type="button"
                onClick={() => setAiMode('scan')}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  aiMode === 'scan'
                    ? 'bg-white text-teal-900 shadow-xs'
                    : 'text-teal-800 hover:text-teal-950'
                }`}
              >
                <Camera className="w-3.5 h-3.5 text-teal-600" />
                <span>Fotoğrafla Tara (OCR)</span>
              </button>
            </div>

            {/* AI Mode 1: Search by Name */}
            {aiMode === 'search' && (
              <div className="space-y-2.5 pt-1">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handlePerformSearch();
                        }
                      }}
                      placeholder="İlaç veya etken madde adı (örn: Coraspin, Parol, Nexium)..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-teal-300 bg-white text-slate-900 text-xs font-medium placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:border-teal-500 shadow-xs"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handlePerformSearch()}
                    disabled={isSearching}
                    className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-95 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 shrink-0 disabled:opacity-60"
                  >
                    {isSearching ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Aranıyor...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Varyantları Bul</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Popular Drug Quick Chips */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] font-bold text-teal-900">Örnekler:</span>
                  {commonSuggestions.map((sug) => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => {
                        setSearchQuery(sug);
                        handlePerformSearch(sug);
                      }}
                      className="text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-white border border-teal-200 text-teal-800 hover:bg-teal-100 hover:border-teal-300 transition shadow-2xs"
                    >
                      {sug}
                    </button>
                  ))}
                </div>

                {/* Search Results List */}
                {searchResults.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-teal-200/80 animate-in fade-in">
                    <div className="flex items-center justify-between text-xs font-bold text-teal-950">
                      <span>Bulunan İlaç Tipleri & Varyantları ({searchResults.length}):</span>
                      <span className="text-[11px] text-teal-700 font-normal">
                        Forma aktarmak için birine tıklayın 👇
                      </span>
                    </div>

                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      {searchResults.map((variant, idx) => {
                        const isSelected = selectedVariantName === variant.name;
                        return (
                          <div
                            key={idx}
                            onClick={() => handleSelectVariant(variant)}
                            className={`p-3 rounded-xl border transition-all cursor-pointer text-left ${
                              isSelected
                                ? 'bg-teal-100/90 border-teal-500 shadow-xs'
                                : 'bg-white hover:bg-teal-50/60 border-teal-200 hover:border-teal-400'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h5 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                                  <span>{variant.name}</span>
                                  {isSelected && (
                                    <span className="text-[10px] font-bold px-1.5 py-0.2 bg-teal-600 text-white rounded-md flex items-center gap-0.5">
                                      <Check className="w-2.5 h-2.5" /> Seçildi
                                    </span>
                                  )}
                                </h5>

                                <div className="flex items-center gap-1.5 text-[11px] text-slate-600 font-medium mt-1 flex-wrap">
                                  <span className="px-1.5 py-0.5 rounded-md bg-teal-50 border border-teal-200 text-teal-800 font-bold">
                                    {variant.dosage}
                                  </span>
                                  <span className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-700">
                                    {formOptions.find((f) => f.id === variant.form)?.label || variant.form}
                                  </span>
                                  <span className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-700">
                                    {variant.instructions === 'before_meal' ? 'Aç Karnına' : variant.instructions === 'after_meal' ? 'Tok Karnına' : 'Yemekle'}
                                  </span>
                                  {variant.stockCount > 0 && (
                                    <span className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-700">
                                      {variant.stockCount} Adet/Kutu
                                    </span>
                                  )}
                                </div>

                                {variant.notes && (
                                  <p className="text-[11px] text-slate-600 mt-1.5 leading-relaxed bg-slate-50 p-2 rounded-lg border border-slate-100">
                                    <strong>Açıklama:</strong> {variant.notes}
                                  </p>
                                )}
                              </div>

                              <button
                                type="button"
                                className="px-2.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-[11px] shadow-2xs shrink-0 flex items-center gap-1"
                              >
                                <span>Seç</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* AI Mode 2: Camera Scan */}
            {aiMode === 'scan' && (
              <div className="space-y-2 pt-1">
                <p className="text-xs text-slate-600">
                  İlaç kutusunun veya prospektüsünün fotoğrafını yükleyin, yapay zeka adı, dozu ve kullanım şeklini okusun:
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={cameraInputRef}
                    accept="image/*"
                    capture="environment"
                    onChange={handleImageCapture}
                    className="hidden"
                    id="med-camera-input-box"
                  />
                  <label
                    htmlFor="med-camera-input-box"
                    className={`cursor-pointer px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-xs ${
                      isScanning
                        ? 'bg-slate-300 text-slate-600 cursor-not-allowed'
                        : 'bg-teal-600 hover:bg-teal-700 text-white active:scale-95'
                    }`}
                  >
                    {isScanning ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Kutu Okunuyor...</span>
                      </>
                    ) : (
                      <>
                        <Camera className="w-4 h-4" />
                        <span>Fotoğraf Çek veya Dosya Seç</span>
                      </>
                    )}
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Success / Error Messages */}
          {scanSuccessMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{scanSuccessMsg}</span>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Name & Dosage */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                İlaç veya Vitamin Adı *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError('');
                }}
                placeholder="Örn: Coraspin, Parol, Nexium, B12"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 text-sm font-semibold outline-hidden transition placeholder:text-slate-400"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Doz / Miktar
              </label>
              <input
                type="text"
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                placeholder="Örn: 100 mg, 1 Tablet"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 text-sm font-semibold outline-hidden transition placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Form & Color */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                İlaç Türü
              </label>
              <select
                value={form}
                onChange={(e) => setForm(e.target.value as MedicationForm)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 text-sm font-semibold outline-hidden transition"
              >
                {formOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Renk Etiketi
              </label>
              <div className="flex items-center gap-2 pt-1 flex-wrap">
                {colorOptions.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setColor(c.id)}
                    className={`w-7 h-7 rounded-full ${c.bg} transition-transform ${
                      color === c.id ? 'ring-3 ring-slate-900 ring-offset-2 scale-110' : 'opacity-80 hover:opacity-100'
                    }`}
                    title={c.label}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Instructions (Meal timing) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
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
                  className={`py-2 px-2.5 rounded-xl border text-xs font-bold text-center transition ${
                    instructions === item.id
                      ? 'bg-teal-50 border-teal-600 text-teal-900 shadow-2xs'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Reminder Hours */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-teal-600" />
                <span>Hatırlatma Saatleri</span>
              </label>
              <button
                type="button"
                onClick={handleAddTime}
                className="text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Saat Ekle</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {times.map((time, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-1 bg-slate-50 rounded-xl px-2.5 py-1.5 border border-slate-200"
                >
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => handleTimeChange(idx, e.target.value)}
                    className="bg-transparent text-sm font-bold text-slate-900 outline-hidden"
                  />
                  {times.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveTime(idx)}
                      className="p-1 text-slate-400 hover:text-rose-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Days Selection */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Hangi Günler?
              </label>
              <button
                type="button"
                onClick={() => setSelectedDays(selectedDays.length === 7 ? [] : [1, 2, 3, 4, 5, 6, 0])}
                className="text-xs font-bold text-teal-700 hover:text-teal-900"
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
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {d.label}
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-slate-500">
              {selectedDays.length === 0 || selectedDays.length === 7
                ? 'Haftanın her günü hatırlatılacak'
                : `Seçilen ${selectedDays.length} gün hatırlatılacak`}
            </p>
          </div>

          {/* Stock Tracking */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PackageCheck className="w-4 h-4 text-teal-600" />
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Kutu & Stok Takibi
                </span>
              </div>
              <input
                type="checkbox"
                checked={stockEnabled}
                onChange={(e) => setStockEnabled(e.target.checked)}
                className="w-4 h-4 text-teal-600 rounded-md border-slate-300 focus:ring-teal-500"
              />
            </div>

            {stockEnabled && (
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">
                    Kutudaki Kalan Sayı
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={stockCount}
                    onChange={(e) => setStockCount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">
                    Uyarı Eşiği (Kaç kalınca uyarsın?)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={stockAlertThreshold}
                    onChange={(e) => setStockAlertThreshold(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm font-bold"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Medical Notes & Explanation */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Kullanım Notları & Uyarılar
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Örn: Bol su ile için. Mideyi korumak için tok karnına alınmalıdır."
              rows={3}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 text-xs font-medium outline-hidden placeholder:text-slate-400"
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
                className="w-full py-2.5 px-3 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold flex items-center justify-center gap-1.5 transition"
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
              className="w-full py-3.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-[0.99] text-white font-bold text-sm shadow-md shadow-teal-600/20 transition"
            >
              {initialMed ? 'Değişiklikleri Kaydet' : 'İlacı Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
