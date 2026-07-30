'use client';

import { useEffect, useRef, useState } from 'react';

export function UpdateNotification() {
  const [showUpdate, setShowUpdate] = useState(false);
  const registrationRef = useRef<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    let cleanupWaiting: (() => void) | undefined;

    navigator.serviceWorker.ready.then((registration) => {
      registrationRef.current = registration;

      const watchForWaiting = (worker: ServiceWorker | null) => {
        cleanupWaiting?.();
        if (!worker) return;

        const onStateChange = () => {
          if (worker.state === 'installed' && navigator.serviceWorker.controller) {
            setShowUpdate(true);
          }
        };
        worker.addEventListener('statechange', onStateChange);
        cleanupWaiting = () => worker.removeEventListener('statechange', onStateChange);
      };

      // A worker may already be waiting from an update detected before this mounted.
      if (registration.waiting && navigator.serviceWorker.controller) {
        setShowUpdate(true);
      }

      registration.addEventListener('updatefound', () => {
        watchForWaiting(registration.installing);
      });

      // iOS suspends timers/effects while a home-screen PWA is backgrounded, so a plain
      // interval may never fire during a typical open-app/close-app session. Checking on
      // visibility/focus ties the check to the moment the app actually gets to run JS.
      const checkForUpdate = () => registration.update();
      const onVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
          checkForUpdate();
        }
      };

      checkForUpdate();
      document.addEventListener('visibilitychange', onVisibilityChange);
      window.addEventListener('focus', checkForUpdate);
      const checkInterval = setInterval(checkForUpdate, 60000);

      return () => {
        document.removeEventListener('visibilitychange', onVisibilityChange);
        window.removeEventListener('focus', checkForUpdate);
        clearInterval(checkInterval);
      };
    });

    let reloadingOnce = false;
    const onControllerChange = () => {
      if (reloadingOnce) return;
      reloadingOnce = true;
      window.location.reload();
    };
    navigator.serviceWorker.addEventListener('controllerchange', onControllerChange);

    return () => {
      cleanupWaiting?.();
      navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange);
    };
  }, []);

  const handleUpdate = () => {
    registrationRef.current?.waiting?.postMessage({ type: 'SKIP_WAITING' });
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
