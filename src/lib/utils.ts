import { WineType, type BottleInstance } from './types';

export function getWineColor(type: WineType): string {
  const colors: Record<WineType, string> = {
    [WineType.RED]: '#722F37',
    [WineType.WHITE]: '#F4E8C1',
    [WineType.ROSE]: '#FFB6C1',
    [WineType.SPARKLING]: '#FFD700',
    [WineType.DESSERT]: '#D4A574',
    [WineType.OTHER]: '#9CA3AF',
  };

  return colors[type];
}

export function formatPrice(price: number | undefined): string {
  if (price == null) {
    return 'N/A';
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
}

export function getAvailableSlots(bottles: BottleInstance[]): number[] {
  const occupiedSlots = new Set(bottles.map((b) => b.slot_position));
  const allSlots = Array.from({ length: 24 }, (_, i) => i + 1);
  return allSlots.filter((slot) => !occupiedSlots.has(slot));
}

export function isSlotOccupied(slot: number, bottles: BottleInstance[]): boolean {
  return bottles.some((b) => b.slot_position === slot);
}

export function getBottleAtSlot(
  slot: number,
  bottles: BottleInstance[]
): BottleInstance | undefined {
  return bottles.find((b) => b.slot_position === slot);
}
