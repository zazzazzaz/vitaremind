import React, { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-6 sm:w-auto z-50 flex items-center gap-2.5 rounded-2xl bg-slate-900/95 backdrop-blur-md px-4 py-2.5 text-xs font-semibold text-white shadow-xl border border-slate-700 animate-in fade-in">
      <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shrink-0" />
      <div className="flex items-center gap-1.5">
        <WifiOff className="w-3.5 h-3.5 text-amber-300" />
        <span>Çevrimdışı Mod — VitaRemind yerel hafızada sorunsuz çalışıyor.</span>
      </div>
    </div>
  );
};
