'use client';

import { useAuth } from '@/contexts/AuthContext';

interface HeaderProps {
  onMenuClick: () => void;
  showSpaceSwitcher?: boolean;
  spaceSwitcher?: React.ReactNode;
}

export function Header({ onMenuClick, showSpaceSwitcher = false, spaceSwitcher }: HeaderProps) {
  const { user, signOut } = useAuth();

  return (
    <header className="mb-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          {user && (
            <button
              onClick={onMenuClick}
              className="p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors lg:p-2"
              aria-label="Open menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          )}
          <div className="flex items-center gap-3">
            <h1 className="text-3xl md:text-4xl font-bold text-wine-red">Sommething</h1>
            {showSpaceSwitcher && spaceSwitcher}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="text-sm text-gray-600 hidden sm:inline">Welcome, {user.email}</span>
              <button
                onClick={() => signOut()}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                Sign Out
              </button>
            </>
          ) : (
            <span className="text-gray-600">Your wine fridge, visualized</span>
          )}
        </div>
      </div>
    </header>
  );
}
