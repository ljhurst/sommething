import { describe, it, expect } from 'vitest';
import {
  getWineColor,
  formatPrice,
  getAvailableSlots,
  isSlotOccupied,
  getBottleAtSlot,
  calculateCapacity,
  formatCapacity,
  getSpaceTypeLabel,
  getSpaceTypeIconName,
} from '@/lib/utils';
import { WineType, type BottleInstance, type Space } from '@/lib/types';

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

    it('should handle undefined price', () => {
      expect(formatPrice(undefined)).toBe('N/A');
    });

    it('should handle null price', () => {
      expect(formatPrice(null as unknown as undefined)).toBe('N/A');
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
      const bottles: BottleInstance[] = [
        {
          id: '1',
          wine_id: 'wine-1',
          space_id: 'space-1',
          slot_position: 1,
          added_at: new Date().toISOString(),
          added_by_user_id: 'user-1',
        },
        {
          id: '2',
          wine_id: 'wine-2',
          space_id: 'space-1',
          slot_position: 5,
          added_at: new Date().toISOString(),
          added_by_user_id: 'user-1',
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
    const bottles: BottleInstance[] = [
      {
        id: '1',
        wine_id: 'wine-1',
        space_id: 'space-1',
        slot_position: 5,
        added_at: new Date().toISOString(),
        added_by_user_id: 'user-1',
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

  describe('getBottleAtSlot', () => {
    const mockBottles: BottleInstance[] = [
      {
        id: '1',
        wine_id: 'wine-1',
        space_id: 'space-1',
        slot_position: 5,
        added_at: '2024-01-01T00:00:00Z',
        added_by_user_id: 'user-1',
      },
      {
        id: '2',
        wine_id: 'wine-2',
        space_id: 'space-1',
        slot_position: 12,
        added_at: '2024-01-01T00:00:00Z',
        added_by_user_id: 'user-1',
      },
    ];

    it('should return bottle at specified slot', () => {
      const bottle = getBottleAtSlot(5, mockBottles);
      expect(bottle).toBeDefined();
      expect(bottle?.id).toBe('1');
      expect(bottle?.slot_position).toBe(5);
    });

    it('should return undefined if slot is empty', () => {
      expect(getBottleAtSlot(1, mockBottles)).toBeUndefined();
      expect(getBottleAtSlot(24, mockBottles)).toBeUndefined();
    });

    it('should return undefined for empty bottle array', () => {
      expect(getBottleAtSlot(1, [])).toBeUndefined();
    });
  });

  describe('calculateCapacity', () => {
    const mockSpace: Space = {
      id: 'space-1',
      owner_user_id: 'user-1',
      name: 'My Fridge',
      description: 'Test fridge',
      rows: 6,
      columns: 4,
      space_type: 'fridge',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    };

    it('should calculate capacity correctly', () => {
      const result = calculateCapacity(mockSpace, 12);
      expect(result.total).toBe(24);
      expect(result.used).toBe(12);
      expect(result.percentage).toBe(50);
    });

    it('should handle zero bottles', () => {
      const result = calculateCapacity(mockSpace, 0);
      expect(result.total).toBe(24);
      expect(result.used).toBe(0);
      expect(result.percentage).toBe(0);
    });

    it('should handle full capacity', () => {
      const result = calculateCapacity(mockSpace, 24);
      expect(result.total).toBe(24);
      expect(result.used).toBe(24);
      expect(result.percentage).toBe(100);
    });

    it('should round percentage', () => {
      const result = calculateCapacity(mockSpace, 5);
      expect(result.percentage).toBe(21);
    });
  });

  describe('formatCapacity', () => {
    it('should format capacity with percentage', () => {
      expect(formatCapacity(12, 24)).toBe('12/24 (50%)');
    });

    it('should handle zero used', () => {
      expect(formatCapacity(0, 24)).toBe('0/24 (0%)');
    });

    it('should handle full capacity', () => {
      expect(formatCapacity(24, 24)).toBe('24/24 (100%)');
    });

    it('should round percentage', () => {
      expect(formatCapacity(5, 24)).toBe('5/24 (21%)');
    });

    it('should handle zero total gracefully', () => {
      expect(formatCapacity(0, 0)).toBe('0/0 (0%)');
    });
  });

  describe('getSpaceTypeLabel', () => {
    it('should return correct label for fridge', () => {
      expect(getSpaceTypeLabel('fridge')).toBe('Fridge');
    });

    it('should return correct label for cellar', () => {
      expect(getSpaceTypeLabel('cellar')).toBe('Cellar');
    });

    it('should return correct label for rack', () => {
      expect(getSpaceTypeLabel('rack')).toBe('Rack');
    });

    it('should return input as fallback for unknown type', () => {
      expect(getSpaceTypeLabel('custom')).toBe('custom');
    });
  });

  describe('getSpaceTypeIconName', () => {
    it('should return correct icon name for fridge', () => {
      expect(getSpaceTypeIconName('fridge')).toBe('snowflake');
    });

    it('should return correct icon name for cellar', () => {
      expect(getSpaceTypeIconName('cellar')).toBe('building');
    });

    it('should return correct icon name for rack', () => {
      expect(getSpaceTypeIconName('rack')).toBe('archive');
    });

    it('should return default icon name for unknown type', () => {
      expect(getSpaceTypeIconName('custom')).toBe('mapPin');
    });
  });
});
