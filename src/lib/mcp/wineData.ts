import type { SupabaseClient } from '@supabase/supabase-js';
import { TABLES } from '@/lib/constants';

export interface CellarWineSummary {
  winery: string;
  name: string;
  type: string;
  year: number;
  price: number | null;
  score: number | null;
  notes: string | null;
  spaceName: string;
  slotPosition: number;
}

export interface RatedWineSummary {
  winery: string;
  name: string;
  type: string;
  year: number;
  rating: 'thumbs_up' | 'thumbs_down';
  consumedAt: string;
  consumptionNotes: string | null;
}

interface CellarWineRow {
  slot_position: number;
  wine: {
    winery: string;
    name: string;
    type: string;
    year: number;
    price: number | null;
    score: number | null;
    notes: string | null;
  } | null;
  space: { name: string } | null;
}

export async function getCellarWines(client: SupabaseClient): Promise<CellarWineSummary[]> {
  const { data, error } = await client
    .from(TABLES.BOTTLES)
    .select(
      'slot_position, wine:wines!inner(winery, name, type, year, price, score, notes), space:spaces!inner(name)'
    )
    .order('added_at', { ascending: true });

  if (error) throw error;

  const rows = (data ?? []) as unknown as CellarWineRow[];

  return rows
    .filter(
      (row): row is CellarWineRow & { wine: NonNullable<CellarWineRow['wine']> } => row.wine != null
    )
    .map((row) => ({
      winery: row.wine.winery,
      name: row.wine.name,
      type: row.wine.type,
      year: row.wine.year,
      price: row.wine.price ?? null,
      score: row.wine.score ?? null,
      notes: row.wine.notes ?? null,
      spaceName: row.space?.name ?? 'Unknown',
      slotPosition: row.slot_position,
    }));
}

interface RatedWineRow {
  consumed_at: string;
  notes: string | null;
  rating: 'thumbs_up' | 'thumbs_down' | null;
  wine: {
    winery: string;
    name: string;
    type: string;
    year: number;
  } | null;
}

export async function getRatedWines(
  client: SupabaseClient,
  limit: number
): Promise<RatedWineSummary[]> {
  const { data, error } = await client
    .from(TABLES.CONSUMPTIONS)
    .select('consumed_at, notes, rating, wine:wines!inner(winery, name, type, year)')
    .not('rating', 'is', null)
    .order('consumed_at', { ascending: false })
    .limit(limit);

  if (error) throw error;

  const rows = (data ?? []) as unknown as RatedWineRow[];

  return rows
    .filter(
      (
        row
      ): row is RatedWineRow & {
        wine: NonNullable<RatedWineRow['wine']>;
        rating: 'thumbs_up' | 'thumbs_down';
      } => row.wine != null && row.rating != null
    )
    .map((row) => ({
      winery: row.wine.winery,
      name: row.wine.name,
      type: row.wine.type,
      year: row.wine.year,
      rating: row.rating,
      consumedAt: row.consumed_at,
      consumptionNotes: row.notes ?? null,
    }));
}
