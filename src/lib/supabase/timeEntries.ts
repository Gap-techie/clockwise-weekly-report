import { supabase } from '@/lib/supabaseClient';
import { TimeEntry } from '@/types/timeTracker';

interface CreateTimeEntryArgs {
  userId: string;
  projectId: string;
  jobId: string;
}

export const createTimeEntry = async ({ userId, projectId, jobId }: CreateTimeEntryArgs): Promise<TimeEntry> => {
  const now = new Date().toISOString();
  
  const { data, error } = await supabase
    .from('time_entries')
    .insert({
      user_id: userId,
      project_id: projectId,
      job_id: jobId,
      clock_in: now,
      is_complete: false
    })
    .select(`
      *,
      jobs (
        code
      )
    `)
    .single();

  if (error) throw error;
  return data;
};

export const createDailySummary = async ({
  userId,
  projectId,
  jobId,
  regularHours,
  overtimeHours,
  totalHours,
  date
}: {
  userId: string;
  projectId: string;
  jobId: string;
  regularHours: number;
  overtimeHours: number;
  totalHours: number;
  date: string;
}) => {
  const now = new Date().toISOString();

  // First, try to update existing record
  const { data: existingData, error: updateError } = await supabase
    .from('daily_summaries')
    .update({
      regular_hours: regularHours,
      overtime_hours: overtimeHours,
      total_hours: totalHours
    })
    .eq('user_id', userId)
    .eq('date', date)
    .eq('project_id', projectId)
    .eq('job_id', jobId)
    .select('id');

  // If no record was updated (i.e., doesn't exist), create a new one
  if (!existingData || existingData.length === 0) {
    const { data: newData, error: insertError } = await supabase
      .from('daily_summaries')
      .insert({
        user_id: userId,
        project_id: projectId,
        job_id: jobId,
        date: date,
        day_of_week: new Date(date).getDay(),
        regular_hours: regularHours,
        overtime_hours: overtimeHours,
        total_hours: totalHours,
        break_time: 0,
        created_at: now
      })
      .select('id')
      .single();

    if (insertError) {
      console.error('Error creating daily summary:', insertError);
      throw insertError;
    }

    return newData;
  }

  if (updateError) {
    console.error('Error updating daily summary:', updateError);
    throw updateError;
  }

  return existingData[0];
};
