import { supabase } from '@/lib/supabaseClient';
import { TimeEntry } from '@/types/timeTracker';

interface CreateTimeEntryArgs {
  userId: string;
  projectId: string;
  jobId: string;
}

export async function createTimeEntry({
  userId,
  projectId,
  jobId
}: CreateTimeEntryArgs): Promise<TimeEntry> {
  const { data, error } = await supabase
    .from('time_entries')
    .insert({
      user_id: userId,
      project_id: projectId,
      job_id: jobId,
      clock_in: new Date().toISOString(),
      is_complete: false
    })
    .select('id, user_id, project_id, job_id, clock_in, is_complete')
    .single();

  if (error) {
    console.error('Error creating time entry:', error);
    throw error;
  }

  if (!data) {
    throw new Error('No data returned from time entry creation');
  }

  return data;
}
