import { describe, it, expect } from 'vitest';
import {
  WineType,
  Rating,
  type Wine,
  type BottleInstance,
  type NewWine,
  type NewBottleInstance,
} from '@/lib/types';

describe('Wine Types', () => {
  it('should have all wine types defined', () => {
    expect(WineType.RED).toBe('red');
    expect(WineType.WHITE).toBe('white');
    expect(WineType.ROSE).toBe('rose');
    expect(WineType.SPARKLING).toBe('sparkling');
    expect(WineType.DESSERT).toBe('dessert');
    expect(WineType.OTHER).toBe('other');
  });

  it('should have rating types defined', () => {
    expect(Rating.THUMBS_UP).toBe('thumbs_up');
    expect(Rating.THUMBS_DOWN).toBe('thumbs_down');
  });

  it('should create a valid wine object', () => {
    const wine: Wine = {
      id: '123',
      created_by_user_id: 'user-1',
      winery: 'Château Margaux',
      name: 'Margaux',
      type: WineType.RED,
      year: 2015,
      price: 450.0,
      score: 95,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    expect(wine.winery).toBe('Château Margaux');
    expect(wine.type).toBe(WineType.RED);
  });

  it('should create a valid bottle instance object', () => {
    const bottleInstance: BottleInstance = {
      id: 'bottle-1',
      wine_id: 'wine-1',
      space_id: 'space-1',
      slot_position: 1,
      added_at: new Date().toISOString(),
    };

    expect(bottleInstance.slot_position).toBe(1);
    expect(bottleInstance.wine_id).toBe('wine-1');
  });

  it('should create a new wine without id and timestamps', () => {
    const newWine: NewWine = {
      created_by_user_id: 'user-1',
      winery: 'Domaine de la Romanée-Conti',
      name: 'Romanée-Conti',
      type: WineType.RED,
      year: 2018,
      price: 15000.0,
      score: 100,
    };

    expect(newWine.winery).toBe('Domaine de la Romanée-Conti');
    expect('id' in newWine).toBe(false);
    expect('created_at' in newWine).toBe(false);
  });

  it('should create a new bottle instance without id and timestamp', () => {
    const newBottleInstance: NewBottleInstance = {
      wine_id: 'wine-1',
      space_id: 'space-1',
      slot_position: 15,
    };

    expect(newBottleInstance.slot_position).toBe(15);
    expect('id' in newBottleInstance).toBe(false);
    expect('added_at' in newBottleInstance).toBe(false);
  });
});
