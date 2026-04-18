import type { Bottle, WineType } from './types';

export interface BottlesByType {
  type: WineType;
  count: number;
  percentage: number;
}

export interface WineryStats {
  winery: string;
  count: number;
  totalValue: number;
}

export interface AnalyticsData {
  totalBottles: number;
  totalValue: number;
  averagePrice: number;
  bottlesByType: BottlesByType[];
  topWineries: WineryStats[];
  averageYear: number;
  oldestBottle?: Bottle;
  mostExpensiveBottle?: Bottle;
}

export function calculateAnalytics(bottles: Bottle[]): AnalyticsData {
  if (bottles.length === 0) {
    return {
      totalBottles: 0,
      totalValue: 0,
      averagePrice: 0,
      bottlesByType: [],
      topWineries: [],
      averageYear: new Date().getFullYear(),
    };
  }

  const totalBottles = bottles.length;
  const totalValue = bottles.reduce((sum, b) => sum + b.price, 0);
  const averagePrice = totalValue / totalBottles;

  const typeMap = new Map<WineType, number>();
  bottles.forEach((bottle) => {
    typeMap.set(bottle.type, (typeMap.get(bottle.type) || 0) + 1);
  });

  const bottlesByType: BottlesByType[] = Array.from(typeMap.entries())
    .map(([type, count]) => ({
      type,
      count,
      percentage: (count / totalBottles) * 100,
    }))
    .sort((a, b) => b.count - a.count);

  const wineryMap = new Map<string, { count: number; totalValue: number }>();
  bottles.forEach((bottle) => {
    const existing = wineryMap.get(bottle.winery) || { count: 0, totalValue: 0 };
    wineryMap.set(bottle.winery, {
      count: existing.count + 1,
      totalValue: existing.totalValue + bottle.price,
    });
  });

  const topWineries: WineryStats[] = Array.from(wineryMap.entries())
    .map(([winery, stats]) => ({
      winery,
      count: stats.count,
      totalValue: stats.totalValue,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const averageYear = bottles.reduce((sum, b) => sum + b.year, 0) / totalBottles;

  const oldestBottle = bottles.reduce((oldest, bottle) =>
    bottle.year < oldest.year ? bottle : oldest
  );

  const mostExpensiveBottle = bottles.reduce((most, bottle) =>
    bottle.price > most.price ? bottle : most
  );

  return {
    totalBottles,
    totalValue,
    averagePrice,
    bottlesByType,
    topWineries,
    averageYear: Math.round(averageYear),
    oldestBottle,
    mostExpensiveBottle,
  };
}
