import { describe, it, expect } from 'vitest';
import {
  calculateCapacity,
  formatCapacity,
  getSpaceTypeLabel,
  getSpaceTypeIconName,
} from '@/lib/spaceUtils';
import type { Space } from '@/lib/types';

describe('Space Utilities', () => {
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
