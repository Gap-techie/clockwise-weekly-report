import { supabase } from '../supabaseClient';
import { Break } from '../../types/timeTracker';

export async function startBreak(timeEntryId: string): Promise<Break | null> {
  try {
    const { data, error } = await supabase
      .from('breaks')
      .insert({
        time_entry_id: timeEntryId,
        start_time: new Date().toISOString(),
        is_complete: false
      })
      .select()
      .single();

    if (error) {
      console.error('Error starting break:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error starting break:', error);
    return null;
  }
}

export async function endBreak(breakId: string): Promise<Break | null> {
  try {
    const { data, error } = await supabase
      .from('breaks')
      .update({
        end_time: new Date().toISOString(),
        is_complete: true
      })
      .eq('id', breakId)
      .select()
      .single();

    if (error) {
      console.error('Error ending break:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error ending break:', error);
    return null;
  }
}

export function calculateBreakDeduction(breakDurationMinutes: number): number {
  // Company compensates for first 30 minutes of break
  const deductibleMinutes = Math.max(0, breakDurationMinutes - 30);
  return deductibleMinutes / 60; // Convert to hours
}

export async function getBreaksForTimeEntry(timeEntryId: string): Promise<Break[]> {
  try {
    const { data, error } = await supabase
      .from('breaks')
      .select('*')
      .eq('time_entry_id', timeEntryId);

    if (error) {
      console.error('Error fetching breaks:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching breaks:', error);
    return [];
  }
}