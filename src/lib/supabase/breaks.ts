import { supabase } from '../supabaseClient';
import { Database } from '@/integrations/supabase/types';

type DbFunctions = Database['public']['Functions'] & {
  start_new_break: {
    Args: { user_id: string };
    Returns: Break;
  };
  end_current_break: {
    Args: { user_id: string };
    Returns: void;
  };
};

export interface Break {
  id: string;
  time_entry_id: string;
  start_time: string;
  end_time: string | null;
  is_complete: boolean;
  created_at?: string | null;
}

/**
 * Starts a new break for the current time entry
 */
export async function startBreak(timeEntryId: string): Promise<Break> {
  const { data, error } = await supabase
    .from('breaks')
    .insert([
      {
        time_entry_id: timeEntryId,
        start_time: new Date().toISOString(),
        is_complete: false,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Ends the current active break
 */
export async function endBreak(breakId: string): Promise<Break> {
  const { data, error } = await supabase
    .from('breaks')
    .update({
      end_time: new Date().toISOString(),
      is_complete: true,
    })
    .eq('id', breakId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Gets all breaks for a specific time entry
 */
export const getBreaksByTimeEntry = async (timeEntryId: string): Promise<Break[]> => {
  const { data, error } = await supabase
    .from('breaks')
    .select('*')
    .eq('time_entry_id', timeEntryId)
    .order('start_time', { ascending: false });

  if (error) throw error;
  return data;
};

/**
 * Gets the current active break for a time entry
 */
export const getCurrentBreak = async (timeEntryId: string): Promise<Break | null> => {
  const { data, error } = await supabase
    .from('breaks')
    .select('*')
    .eq('time_entry_id', timeEntryId)
    .eq('is_complete', false)
    .maybeSingle();

  if (error) throw error;
  return data;
};

/**
 * Calculates total break duration in minutes for a time entry,
 * taking into account that the first 30 minutes are compensated
 */
export const calculateBreakDeduction = (breaks: Break[]): number => {
  let totalMinutes = 0;
  
  breaks.forEach(breakEntry => {
    if (breakEntry.end_time) {
      const startTime = new Date(breakEntry.start_time);
      const endTime = new Date(breakEntry.end_time);
      const durationMinutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60);
      totalMinutes += durationMinutes;
    }
  });

  // Subtract 30 minutes (company compensated break time)
  const deductibleMinutes = Math.max(0, totalMinutes - 30);
  
  return deductibleMinutes;
};