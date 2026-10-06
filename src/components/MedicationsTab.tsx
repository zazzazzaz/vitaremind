import React, { useState } from 'react';
import { useApp, formatInstructions } from '../context/AppContext';
import { Medication } from '../types';
import { 
  Pill, 
  Plus, 
  Search, 
  Clock, 
  Package, 
  Edit3, 
  Power, 
  AlertTriangle 
} from 'lucide-react';

interface MedicationsTabProps {
  onOpenAddModal: () => void;
  onEditMed: (med: Medication) => void;
}

export const MedicationsTab: React.FC<MedicationsTabProps> = ({ onOpenAddModal, onEditMed }) => {
  const { medications, toggleMedicationActive, refillStock } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [refillMedId, setRefillMedId] = useState<string | null>(null);
  const [refillAmount, setRefillAmount] = useState<number>(30);

  const filteredMeds = medications.filter((m) =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.dosage.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (m.notes && m.notes.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleRefillSubmit = (medId: string) => {
    if (refillAmount > 0) {
      refillStock(medId, refillAmount);
      setRefillMedId(null);
    }
  };

  return (
    <div className="space-y-6 pb-24 max-w-4xl mx-auto px-4 pt-4">
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">İlaçlarım & Vitaminlerim</h2>
          <p className="text-xs text-slate-500">
            Toplam {medications.length} kayıtlı ilaç ({medications.filter((m) => m.active).length} aktif)
          </p>
        </div>

        <button
          onClick={onOpenAddModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 active:scale-95 text-white font-bold text-xs shadow-md shadow-teal-600/25 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Yeni İlaç Ekle</span>
        </button>
      </div>

      {/* Search Input */}
      {medications.length > 0 && (
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="İlaç veya vitamin adına göre ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white text-slate-900 rounded-2xl border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 text-xs font-semibold outline-hidden shadow-xs transition placeholder:text-slate-400"
          />
        </div>
      )}

      {/* Medications List */}
      {medications.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 border border-slate-200/80 text-center space-y-4 shadow-xs">
          <div className="w-16 h-16 rounded-3xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto">
            <Pill className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-lg">Henüz İlaç Eklenmedi</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              Düzenli kullandığınız vitamin, takviye veya reçeteli ilaçlarınızı ekleyerek kişiselleştirilmiş hatırlatıcıları hemen oluşturun.
            </p>
          </div>
          <button
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md transition"
          >
            <Plus className="w-4 h-4" />
            <span>İlk İlacınızı Ekleyin</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredMeds.map((med) => {
            const isLowStock = med.stockEnabled && med.stockCount <= med.stockAlertThreshold;

            let colorBadgeClass = 'bg-teal-500 text-white';
            if (med.color === 'sky') colorBadgeClass = 'bg-sky-500 text-white';
            if (med.color === 'violet') colorBadgeClass = 'bg-purple-500 text-white';
            if (med.color === 'amber') colorBadgeClass = 'bg-amber-500 text-white';
            if (med.color === 'rose') colorBadgeClass = 'bg-rose-500 text-white';
            if (med.color === 'indigo') colorBadgeClass = 'bg-indigo-500 text-white';

            return (
              <div
                key={med.id}
                className={`rounded-2xl p-5 border transition-all ${
                  med.active
                    ? 'bg-white border-slate-200 shadow-xs hover:border-teal-300'
                    : 'border-slate-200 opacity-60 bg-slate-50/50'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Left Info */}
                  <div className="flex items-start gap-3.5">
                    {/* Color dot/icon */}
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 shadow-xs ${colorBadgeClass}`}
                    >
                      <Pill className="w-5 h-5" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-base font-bold text-slate-900">{med.name}</h4>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {med.dosage}
                        </span>
                        {!med.active && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-600">
                            Pasif
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-1 flex-wrap">
                        <span className="font-medium">{formatInstructions(med.instructions)}</span>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-teal-600" />
                          <span className="font-bold text-slate-700">
                            {med.times.join(', ')}
                          </span>
                        </div>
                      </div>

                      {/* Stock info */}
                      {med.stockEnabled && (
                        <div className="flex items-center gap-2 mt-2">
                          <span
                            className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md ${
                              isLowStock
                                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            <Package className="w-3 h-3" />
                            <span>Kalan Stok: {med.stockCount} adet</span>
                          </span>

                          <button
                            onClick={() => {
                              setRefillMedId(med.id);
                              setRefillAmount(30);
                            }}
                            className="text-[11px] font-bold text-teal-700 hover:text-teal-900 hover:underline"
                          >
                            + Kutu Ekle
                          </button>
                        </div>
                      )}

                      {med.notes && (
                        <p className="text-xs text-slate-600 italic mt-1.5">{med.notes}</p>
                      )}
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <button
                      onClick={() => toggleMedicationActive(med.id)}
                      title={med.active ? 'Pasife Al' : 'Aktifleştir'}
                      className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition ${
                        med.active
                          ? 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <Power className="w-3.5 h-3.5" />
                      <span>{med.active ? 'Aktif' : 'Pasif'}</span>
                    </button>

                    <button
                      onClick={() => onEditMed(med)}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1 transition"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Düzenle</span>
                    </button>
                  </div>
                </div>

                {/* Stock refill sub-panel */}
                {refillMedId === med.id && (
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl animate-in fade-in">
                    <span className="text-xs font-bold text-slate-800">Yeni Kutu Ekle:</span>
                    <input
                      type="number"
                      min="1"
                      value={refillAmount}
                      onChange={(e) => setRefillAmount(Number(e.target.value))}
                      className="w-20 px-2 py-1 rounded-lg border border-slate-300 bg-white text-xs font-bold text-slate-900"
                    />
                    <button
                      onClick={() => handleRefillSubmit(med.id)}
                      className="px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold transition"
                    >
                      Stok Güncelle
                    </button>
                    <button
                      onClick={() => setRefillMedId(null)}
                      className="px-2 py-1 text-slate-400 hover:text-slate-600 text-xs"
                    >
                      Vazgeç
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
