export enum WineType {
  RED = 'red',
  WHITE = 'white',
  ROSE = 'rose',
  SPARKLING = 'sparkling',
  DESSERT = 'dessert',
  OTHER = 'other',
}

export interface WineRating {
  score: number;
  date: string;
}

export interface Wine {
  id: string;
  created_by_user_id: string;
  winery: string;
  name: string;
  type: WineType;
  year: number;
  price?: number;
  score?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Space {
  id: string;
  owner_user_id: string;
  name: string;
  description?: string;
  rows: number;
  columns: number;
  space_type: string;
  created_at: string;
  updated_at: string;
}

export interface SpaceMember {
  id: string;
  space_id: string;
  user_id: string;
  role: 'owner' | 'editor' | 'viewer';
  joined_at: string;
}

export interface BottleInstance {
  id: string;
  wine_id: string;
  space_id: string;
  slot_position: number;
  added_at: string;
  wine?: Wine;
}

export interface Consumption {
  id: string;
  wine_id: string;
  consumed_by_user_id: string;
  space_id: string;
  consumed_at: string;
  notes?: string;
  rating?: WineRating;
  wine?: Wine;
}

export type NewWine = Omit<Wine, 'id' | 'created_at' | 'updated_at'>;
export type UpdateWine = Partial<NewWine>;

export type NewSpace = Omit<Space, 'id' | 'created_at' | 'updated_at'>;
export type UpdateSpace = Partial<NewSpace>;

export type NewBottleInstance = Omit<BottleInstance, 'id' | 'added_at' | 'wine'>;
export type UpdateBottleInstance = Partial<NewBottleInstance>;

export type NewConsumption = Omit<Consumption, 'id' | 'consumed_at' | 'wine'>;

export type BottleData = Pick<Wine, 'winery' | 'name' | 'type' | 'year' | 'price' | 'score'>;
