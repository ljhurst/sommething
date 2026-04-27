import { supabase } from './supabase';
import type { User } from '@supabase/supabase-js';

interface UserEmailResult {
  id: string;
  email: string;
}

export async function getUserEmail(
  userId: string,
  currentUser?: User | null
): Promise<UserEmailResult | undefined> {
  if (currentUser && userId === currentUser.id) {
    return { id: currentUser.id, email: currentUser.email || '' };
  }

  const { data: emailData, error } = await supabase.rpc('get_user_email', {
    user_id: userId,
  });

  if (error) {
    console.error('Error fetching user email:', error);
    return undefined;
  }

  return emailData ? { id: userId, email: emailData } : undefined;
}
