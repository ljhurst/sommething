import { describe, it, expect } from 'vitest';
import { calculateAnalytics } from '@/lib/analytics';
import { WineType, type BottleData } from '@/lib/types';

describe('Analytics', () => {
  const mockBottles: BottleData[] = [
    {
      winery: 'Winery A',
      name: 'Wine 1',
      type: WineType.RED,
      year: 2018,
      price: 50.0,
    },
    {
      winery: 'Winery A',
      name: 'Wine 2',
      type: WineType.RED,
      year: 2020,
      price: 30.0,
    },
    {
      winery: 'Winery B',
      name: 'Wine 3',
      type: WineType.WHITE,
      year: 2021,
      price: 25.0,
    },
    {
      winery: 'Winery C',
      name: 'Wine 4',
      type: WineType.SPARKLING,
      year: 2019,
      price: 100.0,
    },
  ];

  it('should calculate total bottles correctly', () => {
    const analytics = calculateAnalytics(mockBottles);
    expect(analytics.totalBottles).toBe(4);
  });

  it('should calculate total value correctly', () => {
    const analytics = calculateAnalytics(mockBottles);
    expect(analytics.totalValue).toBe(205.0);
  });

  it('should calculate average price correctly', () => {
    const analytics = calculateAnalytics(mockBottles);
    expect(analytics.averagePrice).toBe(51.25);
  });

  it('should group bottles by type', () => {
    const analytics = calculateAnalytics(mockBottles);
    expect(analytics.bottlesByType).toHaveLength(3);

    const redWines = analytics.bottlesByType.find((b) => b.type === WineType.RED);
    expect(redWines?.count).toBe(2);
    expect(redWines?.percentage).toBe(50);
  });

  it('should identify top wineries', () => {
    const analytics = calculateAnalytics(mockBottles);
    expect(analytics.topWineries[0].winery).toBe('Winery A');
    expect(analytics.topWineries[0].count).toBe(2);
    expect(analytics.topWineries[0].totalValue).toBe(80.0);
  });

  it('should calculate average year', () => {
    const analytics = calculateAnalytics(mockBottles);
    expect(analytics.averageYear).toBe(2020);
  });

  it('should identify oldest bottle', () => {
    const analytics = calculateAnalytics(mockBottles);
    expect(analytics.oldestBottle?.year).toBe(2018);
  });

  it('should identify most expensive bottle', () => {
    const analytics = calculateAnalytics(mockBottles);
    expect(analytics.mostExpensiveBottle?.price).toBe(100.0);
  });

  it('should handle empty bottle list', () => {
    const analytics = calculateAnalytics([]);
    expect(analytics.totalBottles).toBe(0);
    expect(analytics.totalValue).toBe(0);
    expect(analytics.averagePrice).toBe(0);
    expect(analytics.bottlesByType).toHaveLength(0);
  });

  it('should handle bottles without prices (undefined)', () => {
    const bottlesWithMissingPrices: BottleData[] = [
      {
        winery: 'Winery A',
        name: 'Wine 1',
        type: WineType.RED,
        year: 2020,
        price: 50.0,
      },
      {
        winery: 'Winery A',
        name: 'Wine 2',
        type: WineType.WHITE,
        year: 2021,
      },
    ];

    const analytics = calculateAnalytics(bottlesWithMissingPrices);
    expect(analytics.totalBottles).toBe(2);
    expect(analytics.totalValue).toBe(50.0);
    expect(analytics.averagePrice).toBe(50.0);
  });

  it('should handle bottles without prices (null)', () => {
    const bottlesWithNullPrices: BottleData[] = [
      {
        winery: 'Winery A',
        name: 'Wine 1',
        type: WineType.RED,
        year: 2020,
        price: 25.0,
      },
      {
        winery: 'Winery A',
        name: 'Wine 2',
        type: WineType.WHITE,
        year: 2021,
        price: null as unknown as undefined,
      },
    ];

    const analytics = calculateAnalytics(bottlesWithNullPrices);
    expect(analytics.totalBottles).toBe(2);
    expect(analytics.totalValue).toBe(25.0);
    expect(analytics.averagePrice).toBe(25.0);
  });

  it('should handle all bottles without prices', () => {
    const bottlesNoPrices: BottleData[] = [
      {
        winery: 'Winery A',
        name: 'Wine 1',
        type: WineType.RED,
        year: 2020,
      },
    ];

    const analytics = calculateAnalytics(bottlesNoPrices);
    expect(analytics.totalBottles).toBe(1);
    expect(analytics.totalValue).toBe(0);
    expect(analytics.averagePrice).toBe(0);
    expect(analytics.mostExpensiveBottle).toBeUndefined();
  });
});
