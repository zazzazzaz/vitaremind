import React from 'react';
import { CalendarCheck, Pill, Droplets, BarChart3, Settings, ShieldCheck } from 'lucide-react';

export type TabType = 'today' | 'medications' | 'water' | 'history' | 'settings';

interface NavbarProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  pillsRemainingToday: number;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onSelectTab, pillsRemainingToday }) => {
  const tabs = [
    {
      id: 'today' as TabType,
      label: 'Bugün',
      icon: CalendarCheck,
      badge: pillsRemainingToday > 0 ? pillsRemainingToday : undefined,
    },
    {
      id: 'medications' as TabType,
      label: 'İlaçlarım',
      icon: Pill,
    },
    {
      id: 'water' as TabType,
      label: 'Su Takibi',
      icon: Droplets,
    },
    {
      id: 'history' as TabType,
      label: 'Geçmiş',
      icon: BarChart3,
    },
    {
      id: 'settings' as TabType,
      label: 'Ayarlar',
      icon: Settings,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] pb-safe transition-colors">
      <div className="max-w-lg mx-auto flex items-center justify-around px-2 py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition-all relative ${
                isActive
                  ? 'text-teal-700 font-bold'
                  : 'text-slate-400 hover:text-slate-600 font-medium'
              }`}
            >
              <div
                className={`relative p-1.5 rounded-xl transition-all ${
                  isActive ? 'bg-teal-50 text-teal-700 scale-110 shadow-xs' : ''
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.badge !== undefined && (
                  <span className="absolute -top-1 -right-1.5 min-w-[18px] h-[18px] px-1 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className={`text-[11px] mt-0.5 tracking-tight ${isActive ? 'font-bold' : ''}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
