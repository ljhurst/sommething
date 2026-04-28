import { describe, it, expect } from 'vitest';
import { formatPrice } from '@/lib/formatUtils';

describe('Format Utilities', () => {
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
});
