import { supabase } from './supabaseClient';

export async function fetchProjects(user) {
  if (!user) return [];

  const { data, error } = await supabase
    .from('projects')
    .select('id, name, description, is_active')
    .eq('is_active', true)
    .order('name');

  if (error) throw error;
  return data || [];
} 