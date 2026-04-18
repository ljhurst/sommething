import { describe, it, expect } from 'vitest';
import { getWineColor, formatPrice, getAvailableSlots, isSlotOccupied } from '@/lib/utils';
import { WineType, type Bottle } from '@/lib/types';

describe('Wine Utilities', () => {
  describe('getWineColor', () => {
    it('should return correct color for red wine', () => {
      expect(getWineColor(WineType.RED)).toBe('#722F37');
    });

    it('should return correct color for white wine', () => {
      expect(getWineColor(WineType.WHITE)).toBe('#F4E8C1');
    });

    it('should return correct color for rosé wine', () => {
      expect(getWineColor(WineType.ROSE)).toBe('#FFB6C1');
    });

    it('should return correct color for sparkling wine', () => {
      expect(getWineColor(WineType.SPARKLING)).toBe('#FFD700');
    });
  });

  describe('formatPrice', () => {
    it('should format price with dollar sign and two decimals', () => {
      expect(formatPrice(25.5)).toBe('$25.50');
      expect(formatPrice(100)).toBe('$100.00');
      expect(formatPrice(1234.56)).toBe('$1,234.56');
    });

    it('should handle zero price', () => {
      expect(formatPrice(0)).toBe('$0.00');
    });
  });

  describe('getAvailableSlots', () => {
    it('should return all slots when no bottles exist', () => {
      const slots = getAvailableSlots([]);
      expect(slots).toHaveLength(24);
      expect(slots).toContain(1);
      expect(slots).toContain(24);
    });

    it('should return only unoccupied slots', () => {
      const bottles: Bottle[] = [
        {
          id: '1',
          winery: 'Test',
          name: 'Wine 1',
          type: WineType.RED,
          year: 2020,
          price: 20,
          slot_position: 1,
          created_at: new Date().toISOString(),
        },
        {
          id: '2',
          winery: 'Test',
          name: 'Wine 2',
          type: WineType.WHITE,
          year: 2021,
          price: 25,
          slot_position: 5,
          created_at: new Date().toISOString(),
        },
      ];

      const slots = getAvailableSlots(bottles);
      expect(slots).toHaveLength(22);
      expect(slots).not.toContain(1);
      expect(slots).not.toContain(5);
      expect(slots).toContain(2);
      expect(slots).toContain(24);
    });
  });

  describe('isSlotOccupied', () => {
    const bottles: Bottle[] = [
      {
        id: '1',
        winery: 'Test',
        name: 'Wine 1',
        type: WineType.RED,
        year: 2020,
        price: 20,
        slot_position: 5,
        created_at: new Date().toISOString(),
      },
    ];

    it('should return true for occupied slot', () => {
      expect(isSlotOccupied(5, bottles)).toBe(true);
    });

    it('should return false for empty slot', () => {
      expect(isSlotOccupied(1, bottles)).toBe(false);
      expect(isSlotOccupied(10, bottles)).toBe(false);
    });
  });
});
