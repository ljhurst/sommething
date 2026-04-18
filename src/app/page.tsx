'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { WineFridgeGrid } from '@/components/WineFridgeGrid';
import { AddBottleModal } from '@/components/AddBottleModal';
import { BottleDetailModal } from '@/components/BottleDetailModal';
import { useBottles } from '@/hooks/useBottles';
import { useConsumption } from '@/hooks/useConsumption';
import type { Bottle, NewBottle, Rating } from '@/lib/types';

const WineFridge3D = dynamic(
  () => import('@/components/WineFridge3D').then((mod) => ({ default: mod.WineFridge3D })),
  { ssr: false }
);

export default function Home() {
  const { bottles, loading, error, addBottle, refetch } = useBottles();
  const { consumeBottle } = useConsumption();

  const [selectedBottle, setSelectedBottle] = useState<Bottle | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [view3D, setView3D] = useState(false);

  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  const handleEmptySlotClick = (slotNumber: number) => {
    setSelectedSlot(slotNumber);
    setShowAddModal(true);
  };

  const handleBottleClick = (bottle: Bottle) => {
    setSelectedBottle(bottle);
    setShowDetailModal(true);
  };

  const handleAddBottle = async (bottle: NewBottle) => {
    await addBottle(bottle);
  };

  const handleConsumeBottle = async (bottleId: string, notes?: string, rating?: Rating) => {
    const bottle = bottles.find((b) => b.id === bottleId);
    if (!bottle) return;

    const success = await consumeBottle({ bottle, notes, rating });
    if (success) {
      await refetch();
    }
  };

  const occupiedCount = bottles.length;
  const capacity = 24;

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <header className="mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-wine-red mb-1">Sommething</h1>
              <p className="text-gray-600">Your wine fridge, visualized</p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/analytics"
                className="px-4 py-2 border border-wine-red text-wine-red rounded-lg hover:bg-wine-red hover:text-white transition-colors text-sm font-medium"
              >
                Analytics
              </Link>
              {isDesktop && (
                <button
                  onClick={() => setView3D(!view3D)}
                  className="px-4 py-2 bg-wine-red text-white rounded-lg hover:bg-wine-red/90 transition-colors text-sm font-medium"
                >
                  {view3D ? '2D Grid' : '3D View'}
                </button>
              )}
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">
                  {occupiedCount}/{capacity}
                </div>
                <div className="text-sm text-gray-600">bottles</div>
              </div>
            </div>
          </div>
        </header>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-wine-red mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your collection...</p>
            </div>
          </div>
        ) : view3D && isDesktop ? (
          <WineFridge3D bottles={bottles} onBottleClick={handleBottleClick} />
        ) : (
          <WineFridgeGrid
            bottles={bottles}
            onBottleClick={handleBottleClick}
            onEmptySlotClick={handleEmptySlotClick}
          />
        )}
      </div>

      <AddBottleModal
        isOpen={showAddModal}
        slotNumber={selectedSlot || 1}
        onClose={() => {
          setShowAddModal(false);
          setSelectedSlot(null);
        }}
        onSubmit={handleAddBottle}
      />

      <BottleDetailModal
        isOpen={showDetailModal}
        bottle={selectedBottle}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedBottle(null);
        }}
        onConsume={handleConsumeBottle}
      />
    </main>
  );
}
