'use client';

import { useEffect, useState } from 'react';

export function UpdateNotification() {
  const [showUpdate, setShowUpdate] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    navigator.serviceWorker.ready.then((registration) => {
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setShowUpdate(true);
            }
          });
        }
      });

      const checkInterval = setInterval(() => {
        registration.update();
      }, 60000);

      return () => clearInterval(checkInterval);
    });
  }, []);

  const handleUpdate = () => {
    window.location.reload();
  };

  if (!showUpdate) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 z-50 animate-slide-up">
      <div className="bg-wine-red text-white rounded-lg shadow-xl p-4 border border-wine-red/20">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-white mb-1">Update Available</h3>
            <p className="text-sm text-white/90 mb-3">
              A new version of Sommething is ready. Reload to get the latest features and
              improvements.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleUpdate}
                className="px-4 py-2 bg-white text-wine-red rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
              >
                Reload Now
              </button>
              <button
                onClick={() => setShowUpdate(false)}
                className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors text-sm font-medium"
              >
                Later
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
