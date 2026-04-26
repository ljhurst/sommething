import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import type { Space, SpaceMember, NewSpace, UpdateSpace } from '@/lib/types';

export function useSpaces() {
  const { user } = useAuth();
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSpaces = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user) {
        setSpaces([]);
        setLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('spaces')
        .select('*')
        .order('created_at', { ascending: true });

      if (fetchError) throw fetchError;
      setSpaces(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch spaces');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const getSpace = async (id: string): Promise<Space | null> => {
    try {
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('spaces')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch space');
      return null;
    }
  };

  const addSpace = async (space: NewSpace): Promise<Space | null> => {
    try {
      setError(null);

      if (!user) {
        setError('You must be logged in to create spaces');
        return null;
      }

      const { data: spaceData, error: insertError } = await supabase
        .from('spaces')
        .insert({ ...space, owner_user_id: user.id })
        .select()
        .single();

      if (insertError) throw insertError;

      if (spaceData) {
        const { error: memberError } = await supabase.from('space_members').insert({
          space_id: spaceData.id,
          user_id: user.id,
          role: 'owner',
        });

        if (memberError) throw memberError;

        setSpaces((prev) => [...prev, spaceData]);
      }

      return spaceData;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create space');
      return null;
    }
  };

  const updateSpace = async (id: string, updates: UpdateSpace): Promise<boolean> => {
    try {
      setError(null);

      const { error: updateError } = await supabase.from('spaces').update(updates).eq('id', id);

      if (updateError) throw updateError;

      setSpaces((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update space');
      return false;
    }
  };

  const deleteSpace = async (id: string): Promise<boolean> => {
    try {
      setError(null);

      const { error: deleteError } = await supabase.from('spaces').delete().eq('id', id);

      if (deleteError) throw deleteError;

      setSpaces((prev) => prev.filter((s) => s.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete space');
      return false;
    }
  };

  const getSpaceMembers = async (spaceId: string): Promise<SpaceMember[]> => {
    try {
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('space_members')
        .select('*')
        .eq('space_id', spaceId);

      if (fetchError) throw fetchError;
      return data || [];
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch space members');
      return [];
    }
  };

  const addSpaceMember = async (
    spaceId: string,
    userId: string,
    role: 'owner' | 'editor' | 'viewer' = 'editor'
  ): Promise<boolean> => {
    try {
      setError(null);

      const { error: insertError } = await supabase.from('space_members').insert({
        space_id: spaceId,
        user_id: userId,
        role,
      });

      if (insertError) throw insertError;
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add space member');
      return false;
    }
  };

  const updateSpaceMember = async (
    memberId: string,
    role: 'owner' | 'editor' | 'viewer'
  ): Promise<boolean> => {
    try {
      setError(null);

      const { error: updateError } = await supabase
        .from('space_members')
        .update({ role })
        .eq('id', memberId);

      if (updateError) throw updateError;
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update space member');
      return false;
    }
  };

  const removeSpaceMember = async (memberId: string): Promise<boolean> => {
    try {
      setError(null);

      const { error: deleteError } = await supabase
        .from('space_members')
        .delete()
        .eq('id', memberId);

      if (deleteError) throw deleteError;
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove space member');
      return false;
    }
  };

  useEffect(() => {
    fetchSpaces();
  }, [fetchSpaces]);

  return {
    spaces,
    loading,
    error,
    addSpace,
    getSpace,
    updateSpace,
    deleteSpace,
    refetch: fetchSpaces,
    getSpaceMembers,
    addSpaceMember,
    updateSpaceMember,
    removeSpaceMember,
  };
}
