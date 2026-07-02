import { supabase } from '../supabaseClient';

export async function fetchMessages() {
  if (!supabase) {
    throw new Error('Supabase is not configured');
  }

  const { data, error } = await supabase
    .from('messages')
    .select('id, content, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function createMessage(content) {
  if (!supabase) {
    throw new Error('Supabase is not configured');
  }

  const { error } = await supabase.from('messages').insert({
    content,
  });

  if (error) {
    throw error;
  }
}
