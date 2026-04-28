import { WineType } from './types';

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
