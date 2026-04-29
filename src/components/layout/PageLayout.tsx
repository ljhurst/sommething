import { ReactNode, useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

export interface PageLayoutProps {
  children: ReactNode;
  showSpaceSwitcher?: boolean;
  spaceSwitcher?: ReactNode;
}

export function PageLayout({ children, showSpaceSwitcher, spaceSwitcher }: PageLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <Header
            onMenuClick={() => setSidebarOpen(true)}
            showSpaceSwitcher={showSpaceSwitcher}
            spaceSwitcher={spaceSwitcher}
          />
          {children}
        </div>
      </main>
    </>
  );
}
