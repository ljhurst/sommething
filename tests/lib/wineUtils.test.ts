import { describe, it, expect } from 'vitest';
import { getWineColor } from '@/lib/wineUtils';
import { WineType } from '@/lib/types';

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
});
