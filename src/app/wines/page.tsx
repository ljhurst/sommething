'use client';

import { useState } from 'react';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { useAuth } from '@/contexts/AuthContext';

export default function WinesPage() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <Header onMenuClick={() => setSidebarOpen(true)} />

          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Wine Library</h2>
              <p className="text-gray-600">Manage your wine collection</p>
            </div>
            {user && (
              <button className="px-4 py-2 bg-wine-red text-white rounded-lg hover:bg-wine-red/90 transition-colors text-sm font-medium flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Add Wine
              </button>
            )}
          </div>

          <div className="text-center py-20">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Coming Soon</h3>
            <p className="text-gray-600">
              The wine library page is under construction. You&apos;ll be able to manage all your
              wines here.
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
