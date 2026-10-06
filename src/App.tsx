import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Navbar, TabType } from './components/Navbar';
import { AlarmModal } from './components/AlarmModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { TodayTab } from './components/TodayTab';
import { MedicationsTab } from './components/MedicationsTab';
import { WaterTab } from './components/WaterTab';
import { HistoryTab } from './components/HistoryTab';
import { SettingsTab } from './components/SettingsTab';
import { AddEditMedModal } from './components/AddEditMedModal';
import { Medication } from './types';

const AppContent: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<TabType>('today');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMed, setEditingMed] = useState<Medication | null>(null);

  const { todayPillsDue, addMedication, updateMedication, deleteMedication } = useApp();

  // Count pending pills for today's badge
  const pendingPillsCount = todayPillsDue.filter(
    (p) => !p.log || p.log.status === 'snoozed'
  ).length;

  const handleOpenAdd = () => {
    setEditingMed(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (med: Medication) => {
    setEditingMed(med);
    setIsAddModalOpen(true);
  };

  const handleSaveMed = (medData: Omit<Medication, 'id' | 'createdAt'>) => {
    if (editingMed) {
      updateMedication(editingMed.id, medData);
    } else {
      addMedication(medData);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800 antialiased selection:bg-teal-500 selection:text-white">
      {/* Main App Top Bar */}
      <Header />

      {/* Main Scrollable View Area */}
      <main className="flex-1 w-full max-w-4xl mx-auto pb-32">
        {currentTab === 'today' && (
          <TodayTab
            onNavigateToTab={(tab) => setCurrentTab(tab)}
            onOpenAddMed={handleOpenAdd}
          />
        )}
        {currentTab === 'medications' && (
          <MedicationsTab
            onOpenAddModal={handleOpenAdd}
            onEditMed={handleOpenEdit}
          />
        )}
        {currentTab === 'water' && <WaterTab />}
        {currentTab === 'history' && <HistoryTab />}
        {currentTab === 'settings' && <SettingsTab />}
      </main>

      {/* Bottom Mobile Navigation */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        pillsRemainingToday={pendingPillsCount}
      />

      {/* Real-time Alarm / Reminder Modal */}
      <AlarmModal />

      {/* Add / Edit Medication Modal */}
      <AddEditMedModal
        isOpen={isAddModalOpen}
        initialMed={editingMed}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingMed(null);
        }}
        onSave={handleSaveMed}
        onDelete={deleteMedication}
      />

      {/* Offline Status Toast */}
      <OfflineIndicator />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
