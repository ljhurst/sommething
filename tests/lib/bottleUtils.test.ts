import { describe, it, expect } from 'vitest';
import { getAvailableSlots, isSlotOccupied, getBottleAtSlot } from '@/lib/bottleUtils';
import type { BottleInstance } from '@/lib/types';

describe('Bottle Utilities', () => {
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
});
