import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useSupabaseOperation } from './useSupabaseQuery';
import { TABLES, ERROR_MESSAGES } from '@/lib/constants';
import { getErrorMessage } from '@/lib/errorHandling';
import type { Space, SpaceMember, NewSpace, UpdateSpace } from '@/lib/types';

export function useSpaces() {
  const { user } = useAuth();
  const { loading, error, setError, execute, executeWithBool } = useSupabaseOperation();
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [fetchLoading, setFetchLoading] = useState(true);

  const fetchSpaces = useCallback(async () => {
    try {
      setFetchLoading(true);
      setError(null);

      if (!user) {
        setSpaces([]);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from(TABLES.SPACES)
        .select('*')
        .order('created_at', { ascending: true });

      if (fetchError) throw fetchError;
      setSpaces(data || []);
    } catch (err) {
      setError(getErrorMessage(err, ERROR_MESSAGES.FETCH_FAILED('spaces')));
    } finally {
      setFetchLoading(false);
    }
  }, [user, setError]);

  const getSpace = useCallback(
    async (id: string): Promise<Space | null> => {
      return execute(async () => {
        const { data, error: fetchError } = await supabase
          .from(TABLES.SPACES)
          .select('*')
          .eq('id', id)
          .single();

        if (fetchError) throw fetchError;
        return data;
      }, ERROR_MESSAGES.FETCH_FAILED('space'));
    },
    [execute]
  );

  const addSpace = useCallback(
    async (space: NewSpace): Promise<Space | null> => {
      if (!user) {
        setError(ERROR_MESSAGES.AUTH_REQUIRED);
        return null;
      }

      return execute(async () => {
        const { data: spaceData, error: insertError } = await supabase
          .from(TABLES.SPACES)
          .insert({ ...space, owner_user_id: user.id })
          .select()
          .single();

        if (insertError) throw insertError;

        if (spaceData) {
          const { error: memberError } = await supabase.from(TABLES.SPACE_MEMBERS).insert({
            space_id: spaceData.id,
            user_id: user.id,
            role: 'owner',
          });

          if (memberError) throw memberError;

          setSpaces((prev) => [...prev, spaceData]);
        }

        return spaceData;
      }, ERROR_MESSAGES.ADD_FAILED('space'));
    },
    [user, execute, setError]
  );

  const updateSpace = useCallback(
    async (id: string, updates: UpdateSpace): Promise<boolean> => {
      return executeWithBool(async () => {
        const { error: updateError } = await supabase
          .from(TABLES.SPACES)
          .update(updates)
          .eq('id', id);

        if (updateError) throw updateError;

        setSpaces((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
      }, ERROR_MESSAGES.UPDATE_FAILED('space'));
    },
    [executeWithBool]
  );

  const deleteSpace = useCallback(
    async (id: string): Promise<boolean> => {
      return executeWithBool(async () => {
        const { error: deleteError } = await supabase.from(TABLES.SPACES).delete().eq('id', id);

        if (deleteError) throw deleteError;

        setSpaces((prev) => prev.filter((s) => s.id !== id));
      }, ERROR_MESSAGES.DELETE_FAILED('space'));
    },
    [executeWithBool]
  );

  const getSpaceMembers = useCallback(
    async (spaceId: string): Promise<SpaceMember[]> => {
      const result = await execute(async () => {
        const { data, error: fetchError } = await supabase
          .from(TABLES.SPACE_MEMBERS)
          .select('*')
          .eq('space_id', spaceId);

        if (fetchError) throw fetchError;
        return data || [];
      }, ERROR_MESSAGES.FETCH_FAILED('space members'));

      return result || [];
    },
    [execute]
  );

  const addSpaceMember = useCallback(
    async (
      spaceId: string,
      userId: string,
      role: 'owner' | 'editor' | 'viewer' = 'editor'
    ): Promise<boolean> => {
      return executeWithBool(async () => {
        const { error: insertError } = await supabase.from(TABLES.SPACE_MEMBERS).insert({
          space_id: spaceId,
          user_id: userId,
          role,
        });

        if (insertError) throw insertError;
      }, ERROR_MESSAGES.ADD_FAILED('space member'));
    },
    [executeWithBool]
  );

  const updateSpaceMember = useCallback(
    async (memberId: string, role: 'owner' | 'editor' | 'viewer'): Promise<boolean> => {
      return executeWithBool(async () => {
        const { error: updateError } = await supabase
          .from(TABLES.SPACE_MEMBERS)
          .update({ role })
          .eq('id', memberId);

        if (updateError) throw updateError;
      }, ERROR_MESSAGES.UPDATE_FAILED('space member'));
    },
    [executeWithBool]
  );

  const removeSpaceMember = useCallback(
    async (memberId: string): Promise<boolean> => {
      return executeWithBool(async () => {
        const { error: deleteError } = await supabase
          .from(TABLES.SPACE_MEMBERS)
          .delete()
          .eq('id', memberId);

        if (deleteError) throw deleteError;
      }, ERROR_MESSAGES.DELETE_FAILED('space member'));
    },
    [executeWithBool]
  );

  useEffect(() => {
    fetchSpaces();
  }, [fetchSpaces]);

  return {
    spaces,
    loading: fetchLoading || loading,
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
