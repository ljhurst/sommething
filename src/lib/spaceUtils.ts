import type { Space } from './types';

export function calculateCapacity(space: Space, bottleCount: number) {
  const total = space.rows * space.columns;
  const percentage = total > 0 ? Math.round((bottleCount / total) * 100) : 0;
  return { total, used: bottleCount, percentage };
}

export function formatCapacity(used: number, total: number): string {
  const percentage = total > 0 ? Math.round((used / total) * 100) : 0;
  return `${used}/${total} (${percentage}%)`;
}

export function getSpaceTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    fridge: 'Fridge',
    cellar: 'Cellar',
    rack: 'Rack',
  };
  return labels[type] || type;
}

export function getSpaceTypeIconName(type: string): string {
  const icons: Record<string, string> = {
    fridge: 'snowflake',
    cellar: 'building',
    rack: 'archive',
  };
  return icons[type] || 'mapPin';
}
