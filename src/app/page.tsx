'use client';

import { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { WineFridgeGrid } from '@/components/WineFridgeGrid';
import { AddBottleModal } from '@/components/AddBottleModal';
import { BottleDetailModal } from '@/components/BottleDetailModal';
import { AuthModal } from '@/components/AuthModal';
import { SpaceSwitcher } from '@/components/SpaceSwitcher';
import { CreateSpaceModal } from '@/components/CreateSpaceModal';
import { useBottles } from '@/hooks/useBottles';
import { useWines } from '@/hooks/useWines';
import { useSpaces } from '@/hooks/useSpaces';
import { useConsumption } from '@/hooks/useConsumption';
import { useCurrentSpace } from '@/hooks/useCurrentSpace';
import { useAuth } from '@/contexts/AuthContext';
import type { BottleInstance, NewWine, NewSpace, Rating } from '@/lib/types';

const WineFridge3D = dynamic(
  () => import('@/components/WineFridge3D').then((mod) => ({ default: mod.WineFridge3D })),
  { ssr: false }
);

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const { spaces, loading: spacesLoading, addSpace } = useSpaces();
  const { currentSpace, selectSpace } = useCurrentSpace(spaces);
  const { bottles, loading, error, addBottle, refetch } = useBottles(currentSpace?.id);
  const { addWine } = useWines();
  const { consumeBottle } = useConsumption();

  const [selectedBottle, setSelectedBottle] = useState<BottleInstance | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showCreateSpaceModal, setShowCreateSpaceModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [view3D, setView3D] = useState(false);

  const bottleCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    spaces.forEach((space) => {
      counts[space.id] = 0;
    });
    bottles.forEach((bottle) => {
      if (bottle.space_id && counts[bottle.space_id] !== undefined) {
        counts[bottle.space_id]++;
      }
    });
    return counts;
  }, [spaces, bottles]);

  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  const handleEmptySlotClick = (slotNumber: number) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    setSelectedSlot(slotNumber);
    setShowAddModal(true);
  };

  const handleBottleClick = (bottle: BottleInstance) => {
    setSelectedBottle(bottle);
    setShowDetailModal(true);
  };

  const handleAddBottle = async (wine: NewWine, slotPosition: number) => {
    if (!currentSpace) return;

    const createdWine = await addWine(wine);
    if (createdWine) {
      await addBottle({
        wine_id: createdWine.id,
        space_id: currentSpace.id,
        slot_position: slotPosition,
      });
    }
  };

  const handleConsumeBottle = async (bottleId: string, notes?: string, rating?: Rating) => {
    const bottle = bottles.find((b) => b.id === bottleId);
    if (!bottle) return;

    const success = await consumeBottle({ bottle, notes, rating });
    if (success) {
      await refetch();
    }
  };

  const handleCreateSpace = async (space: Omit<NewSpace, 'owner_user_id'>) => {
    const createdSpace = await addSpace(space as NewSpace);
    if (createdSpace) {
      selectSpace(createdSpace.id);
    }
  };

  return (
    <>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <Header
            onMenuClick={() => setSidebarOpen(true)}
            showSpaceSwitcher={!!(user && spaces.length > 0)}
            spaceSwitcher={
              <SpaceSwitcher
                spaces={spaces}
                currentSpaceId={currentSpace?.id || null}
                bottleCounts={bottleCounts}
                onSpaceChange={selectSpace}
                onCreateNew={() => setShowCreateSpaceModal(true)}
              />
            }
          />

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {!user && (
            <div className="flex items-center justify-center py-20">
              <div className="text-center max-w-md">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to Sommething</h2>
                <p className="text-gray-600 mb-6">
                  Track your wine collection with elegance and ease. Sign in to get started.
                </p>
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="px-6 py-3 bg-wine-red text-white rounded-lg hover:bg-wine-red/90 transition-colors text-lg font-medium"
                >
                  Sign In or Create Account
                </button>
              </div>
            </div>
          )}

          {user && (authLoading || loading || spacesLoading) && (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-wine-red mx-auto mb-4"></div>
                <p className="text-gray-600">Loading your collection...</p>
              </div>
            </div>
          )}

          {user && !authLoading && !loading && !spacesLoading && (
            <>
              {isDesktop && currentSpace && (
                <div className="flex justify-end mb-4">
                  <button
                    onClick={() => setView3D(!view3D)}
                    className="px-4 py-2 bg-wine-red text-white rounded-lg hover:bg-wine-red/90 transition-colors text-sm font-medium"
                  >
                    {view3D ? '2D Grid' : '3D View'}
                  </button>
                </div>
              )}

              {view3D && isDesktop ? (
                <WineFridge3D bottles={bottles} onBottleClick={handleBottleClick} />
              ) : (
                <WineFridgeGrid
                  bottles={bottles}
                  onBottleClick={handleBottleClick}
                  onEmptySlotClick={handleEmptySlotClick}
                />
              )}
            </>
          )}
        </div>

        {currentSpace && (
          <AddBottleModal
            isOpen={showAddModal}
            slotNumber={selectedSlot || 1}
            spaceId={currentSpace.id}
            onClose={() => {
              setShowAddModal(false);
              setSelectedSlot(null);
            }}
            onSubmit={handleAddBottle}
          />
        )}

        <BottleDetailModal
          isOpen={showDetailModal}
          bottle={selectedBottle}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedBottle(null);
          }}
          onConsume={handleConsumeBottle}
        />

        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />

        <CreateSpaceModal
          isOpen={showCreateSpaceModal}
          onClose={() => setShowCreateSpaceModal(false)}
          onSubmit={handleCreateSpace}
        />
      </main>
    </>
  );
}
