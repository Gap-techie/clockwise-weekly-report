import { supabase } from '@/lib/supabaseClient';
import { Job } from '@/types/timeTracker';

export async function fetchActiveJobByCode(jobCode: string): Promise<Job> {
  const { data, error } = await supabase
    .from('jobs')
    .select('id, code')
    .ilike('code', jobCode.trim())
    .eq('is_active', true)
    .single();

  if (error) {
    console.error('Error fetching job:', error);
    throw new Error('Could not find job code. Please try again.');
  }

  if (!data) {
    throw new Error('Invalid Job Code');
  }

  return data;
}
