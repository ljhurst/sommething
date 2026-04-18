export enum WineType {
  RED = 'red',
  WHITE = 'white',
  ROSE = 'rose',
  SPARKLING = 'sparkling',
  DESSERT = 'dessert',
  OTHER = 'other',
}

export enum Rating {
  THUMBS_UP = 'thumbs_up',
  THUMBS_DOWN = 'thumbs_down',
}

export interface Bottle {
  id: string;
  winery: string;
  name: string;
  type: WineType;
  year: number;
  price: number;
  score?: number;
  notes?: string;
  rating?: Rating;
  slot_position: number;
  created_at: string;
}

export interface ConsumptionHistory {
  id: string;
  bottle_id: string;
  consumed_at: string;
  notes?: string;
  rating?: Rating;
}

export interface BottleWithHistory extends Bottle {
  consumption_history?: ConsumptionHistory[];
}

export type NewBottle = Omit<Bottle, 'id' | 'created_at'>;
export type UpdateBottle = Partial<NewBottle>;
