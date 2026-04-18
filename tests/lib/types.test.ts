import { describe, it, expect } from 'vitest';
import { WineType, Rating, type Bottle, type NewBottle } from '@/lib/types';

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

  it('should create a valid bottle object', () => {
    const bottle: Bottle = {
      id: '123',
      winery: 'Château Margaux',
      name: 'Margaux',
      type: WineType.RED,
      year: 2015,
      price: 450.0,
      score: 95,
      slot_position: 1,
      created_at: new Date().toISOString(),
    };

    expect(bottle.winery).toBe('Château Margaux');
    expect(bottle.type).toBe(WineType.RED);
    expect(bottle.slot_position).toBe(1);
  });

  it('should create a new bottle without id and created_at', () => {
    const newBottle: NewBottle = {
      winery: 'Domaine de la Romanée-Conti',
      name: 'Romanée-Conti',
      type: WineType.RED,
      year: 2018,
      price: 15000.0,
      score: 100,
      slot_position: 15,
    };

    expect(newBottle.winery).toBe('Domaine de la Romanée-Conti');
    expect('id' in newBottle).toBe(false);
    expect('created_at' in newBottle).toBe(false);
  });
});
