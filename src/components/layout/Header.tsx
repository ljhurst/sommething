'use client';

import { useAuth } from '@/contexts/AuthContext';
import { ProfileDropdown } from './ProfileDropdown';

interface HeaderProps {
  onMenuClick: () => void;
  showSpaceSwitcher?: boolean;
  spaceSwitcher?: React.ReactNode;
}

export function Header({ onMenuClick, showSpaceSwitcher = false, spaceSwitcher }: HeaderProps) {
  const { user, signOut } = useAuth();

  return (
    <header className="mb-6">
      {user ? (
        <>
          {/* Logged In: Row 1 + Row 2 */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={onMenuClick}
                className="p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
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
              <h1 className="text-3xl md:text-4xl font-bold text-wine-red">Sommething</h1>
            </div>

            <div className="flex items-center gap-3">
              {/* Mobile: Profile Icon with Dropdown */}
              <div className="md:hidden">
                <ProfileDropdown userEmail={user.email || ''} onSignOut={signOut} />
              </div>

              {/* Desktop: Welcome message + Sign Out button */}
              <div className="hidden md:flex items-center gap-3">
                <span className="text-sm text-gray-600">Welcome, {user.email}</span>
                <button
                  onClick={() => signOut()}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>

          {/* Row 2: Context (Space Switcher) */}
          {showSpaceSwitcher && <div>{spaceSwitcher}</div>}
        </>
      ) : (
        <>
          {/* Logged Out: Centered Layout */}
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-wine-red mb-2">Sommething</h1>
            <p className="text-sm md:text-base text-gray-600">Your wine fridge, visualized</p>
          </div>
        </>
      )}
    </header>
  );
}
