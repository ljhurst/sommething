import { describe, it, expect } from 'vitest';

describe('Module Import Smoke Tests', () => {
  describe('Hooks', () => {
    it('should import useSpaces without errors', async () => {
      const module = await import('@/hooks/useSpaces');
      expect(module.useSpaces).toBeDefined();
      expect(typeof module.useSpaces).toBe('function');
    });

    it('should import useWines without errors', async () => {
      const module = await import('@/hooks/useWines');
      expect(module.useWines).toBeDefined();
      expect(typeof module.useWines).toBe('function');
    });

    it('should import useCurrentSpace without errors', async () => {
      const module = await import('@/hooks/useCurrentSpace');
      expect(module.useCurrentSpace).toBeDefined();
      expect(typeof module.useCurrentSpace).toBe('function');
    });

    it('should import useBottles without errors', async () => {
      const module = await import('@/hooks/useBottles');
      expect(module.useBottles).toBeDefined();
      expect(typeof module.useBottles).toBe('function');
    });

    it('should import useConsumption without errors', async () => {
      const module = await import('@/hooks/useConsumption');
      expect(module.useConsumption).toBeDefined();
      expect(typeof module.useConsumption).toBe('function');
    });
  });

  describe('Lib Modules', () => {
    it('should import supabase client without errors', async () => {
      const module = await import('@/lib/supabase');
      expect(module.supabase).toBeDefined();
    });

    it('should import pwa utils without errors', async () => {
      const module = await import('@/lib/pwa');
      expect(module.registerServiceWorker).toBeDefined();
      expect(typeof module.registerServiceWorker).toBe('function');
    });

    it('should import analytics without errors', async () => {
      const module = await import('@/lib/analytics');
      expect(module.calculateAnalytics).toBeDefined();
      expect(typeof module.calculateAnalytics).toBe('function');
    });

    it('should import utils without errors', async () => {
      const module = await import('@/lib/utils');
      expect(module.getWineColor).toBeDefined();
      expect(module.formatPrice).toBeDefined();
      expect(module.getAvailableSlots).toBeDefined();
    });

    it('should import types without errors', async () => {
      const module = await import('@/lib/types');
      expect(module.WineType).toBeDefined();
      expect(module.Rating).toBeDefined();
    });
  });

  describe('Contexts', () => {
    it('should import AuthContext without errors', async () => {
      const module = await import('@/contexts/AuthContext');
      expect(module.AuthProvider).toBeDefined();
      expect(module.useAuth).toBeDefined();
      expect(module.useUser).toBeDefined();
    });
  });

  describe('Components', () => {
    it('should import BottleCircle without errors', async () => {
      const module = await import('@/components/BottleCircle');
      expect(module.BottleCircle).toBeDefined();
    });

    it('should import EmptySlot without errors', async () => {
      const module = await import('@/components/EmptySlot');
      expect(module.EmptySlot).toBeDefined();
    });

    it('should import BottleSlot without errors', async () => {
      const module = await import('@/components/BottleSlot');
      expect(module.BottleSlot).toBeDefined();
    });
  });
});
