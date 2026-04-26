'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { useBottles } from '@/hooks/useBottles';
import { useConsumption } from '@/hooks/useConsumption';
import { calculateAnalytics, type AnalyticsData } from '@/lib/analytics';
import { formatPrice, getWineColor } from '@/lib/utils';
import type { ConsumptionHistory, BottleData } from '@/lib/types';

export default function AnalyticsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { bottles, loading } = useBottles();
  const { getConsumptionHistory } = useConsumption();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [showConsumed, setShowConsumed] = useState(false);
  const [consumedBottles, setConsumedBottles] = useState<ConsumptionHistory[]>([]);
  const [loadingConsumed, setLoadingConsumed] = useState(false);

  useEffect(() => {
    if (showConsumed && consumedBottles.length === 0) {
      setLoadingConsumed(true);
      getConsumptionHistory()
        .then((data) => setConsumedBottles(data))
        .finally(() => setLoadingConsumed(false));
    }
  }, [showConsumed, consumedBottles.length, getConsumptionHistory]);

  useEffect(() => {
    const currentBottlesData: BottleData[] = bottles
      .filter((b) => b.wine)
      .map((b) => ({
        winery: b.wine!.winery,
        name: b.wine!.name,
        type: b.wine!.type,
        year: b.wine!.year,
        price: b.wine!.price,
        score: b.wine!.score,
      }));

    const consumedBottlesData: BottleData[] = consumedBottles
      .filter((c) => c.wine)
      .map((c) => ({
        winery: c.wine!.winery,
        name: c.wine!.name,
        type: c.wine!.type,
        year: c.wine!.year,
        price: c.wine!.price,
        score: c.wine!.score,
      }));

    const bottleData: BottleData[] = showConsumed
      ? [...currentBottlesData, ...consumedBottlesData]
      : currentBottlesData;

    setAnalytics(calculateAnalytics(bottleData));
  }, [bottles, consumedBottles, showConsumed]);

  return (
    <>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <Header onMenuClick={() => setSidebarOpen(true)} />

          {loading && (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-wine-red mx-auto mb-4"></div>
                <p className="text-gray-600">Loading analytics...</p>
              </div>
            </div>
          )}

          {!loading && (!analytics || analytics.totalBottles === 0) && (
            <div className="text-center py-20">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">No Data Yet</h2>
              <p className="text-gray-600 mb-8">Add some bottles to see analytics</p>
            </div>
          )}

          {!loading && analytics && analytics.totalBottles > 0 && (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>
                </div>
                <div className="flex gap-2 bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setShowConsumed(false)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      !showConsumed
                        ? 'bg-white text-wine-red shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Current Collection
                  </button>
                  <button
                    onClick={() => setShowConsumed(true)}
                    disabled={loadingConsumed}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      showConsumed
                        ? 'bg-white text-wine-red shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    } ${loadingConsumed ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    All Time
                  </button>
                </div>
              </div>
              <p className="text-gray-600 mb-6">
                {showConsumed
                  ? 'Insights across your entire collection history'
                  : 'Insights into your current collection'}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="text-sm text-gray-600 mb-1">Total Bottles</div>
                  <div className="text-3xl font-bold text-gray-900">{analytics.totalBottles}</div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="text-sm text-gray-600 mb-1">Total Value</div>
                  <div className="text-3xl font-bold text-gray-900">
                    {formatPrice(analytics.totalValue)}
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="text-sm text-gray-600 mb-1">Average Price</div>
                  <div className="text-3xl font-bold text-gray-900">
                    {formatPrice(analytics.averagePrice)}
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="text-sm text-gray-600 mb-1">Average Year</div>
                  <div className="text-3xl font-bold text-gray-900">{analytics.averageYear}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Bottles by Type</h2>
                  <div className="space-y-3">
                    {analytics.bottlesByType.map((item) => (
                      <div key={item.type} className="flex items-center">
                        <div
                          className="w-4 h-4 rounded-full mr-3"
                          style={{ backgroundColor: getWineColor(item.type) }}
                        />
                        <div className="flex-1">
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium capitalize">{item.type}</span>
                            <span className="text-sm text-gray-600">
                              {item.count} ({item.percentage.toFixed(0)}%)
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="h-2 rounded-full"
                              style={{
                                width: `${item.percentage}%`,
                                backgroundColor: getWineColor(item.type),
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Top Wineries</h2>
                  <div className="space-y-3">
                    {analytics.topWineries.map((winery, index) => {
                      const badgeColors = [
                        'bg-wine-red', // #1 - Darkest
                        'bg-[#8B4049]', // #2 - Medium dark
                        'bg-[#A45158]', // #3 - Medium
                        'bg-[#BD6267]', // #4 - Medium light
                        'bg-[#D67376]', // #5 - Lightest
                      ];
                      return (
                        <div
                          key={winery.winery}
                          className="flex items-center justify-between py-2 border-b last:border-b-0"
                        >
                          <div className="flex items-center">
                            <div
                              className={`w-8 h-8 rounded-full ${badgeColors[index]} text-white flex items-center justify-center font-bold text-sm mr-3`}
                            >
                              {index + 1}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{winery.winery}</div>
                              <div className="text-sm text-gray-600">
                                {winery.count} bottle{winery.count !== 1 ? 's' : ''}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium text-gray-900">
                              {formatPrice(winery.totalValue)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {analytics.oldestBottle && (
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Oldest Bottle</h2>
                    <div className="flex items-start gap-4">
                      <div
                        className="w-16 h-16 rounded-full flex-shrink-0"
                        style={{ backgroundColor: getWineColor(analytics.oldestBottle.type) }}
                      />
                      <div>
                        <div className="font-bold text-lg text-gray-900">
                          {analytics.oldestBottle.name}
                        </div>
                        <div className="text-gray-600">{analytics.oldestBottle.winery}</div>
                        <div className="text-sm text-gray-500 mt-1">
                          {analytics.oldestBottle.year} •{' '}
                          {formatPrice(analytics.oldestBottle.price)}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {analytics.mostExpensiveBottle && (
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Most Expensive</h2>
                    <div className="flex items-start gap-4">
                      <div
                        className="w-16 h-16 rounded-full flex-shrink-0"
                        style={{
                          backgroundColor: getWineColor(analytics.mostExpensiveBottle.type),
                        }}
                      />
                      <div>
                        <div className="font-bold text-lg text-gray-900">
                          {analytics.mostExpensiveBottle.name}
                        </div>
                        <div className="text-gray-600">{analytics.mostExpensiveBottle.winery}</div>
                        <div className="text-sm text-gray-500 mt-1">
                          {analytics.mostExpensiveBottle.year} •{' '}
                          {formatPrice(analytics.mostExpensiveBottle.price)}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </>
  );
}
