
import { supabase } from '@/lib/supabaseClient';
import { Project, TimeEntry } from '@/lib/types';

// User Functions
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
    
  if (error) throw error;
  return data;
}

// Project Functions
export async function getProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('is_active', true)
    .order('name');
    
  if (error) throw error;
  return data.map(project => ({
    id: project.id,
    name: project.name
  }));
}

// Job Functions
export async function getJobsByProject(projectId: string) {
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('project_id', projectId)
    .eq('is_active', true)
    .order('code');
    
  if (error) throw error;
  return data.map(job => ({
    id: job.id,
    code: job.code,
    title: job.title || job.code
  }));
}

// Time Tracking Functions
export async function clockIn(userId: string, projectId: string, jobId: string): Promise<TimeEntry> {
  // First check if there's already an active time entry
  const { data: activeEntries } = await supabase
    .from('time_entries')
    .select('id')
    .eq('user_id', userId)
    .eq('is_complete', false);
    
  if (activeEntries && activeEntries.length > 0) {
    throw new Error('You already have an active time entry. Please clock out first.');
  }
  
  // Create new time entry
  const { data, error } = await supabase
    .from('time_entries')
    .insert({
      user_id: userId,
      project_id: projectId,
      job_id: jobId,
      clock_in: new Date().toISOString(),
      is_complete: false
    })
    .select()
    .single();
    
  if (error) throw error;
  
  // Get job code for the returned entry
  const { data: job } = await supabase
    .from('jobs')
    .select('code')
    .eq('id', data.job_id)
    .single();
  
  return {
    id: data.id,
    projectId: data.project_id,
    jobId: data.job_id,
    jobCode: job?.code || '',
    clockInTime: new Date(data.clock_in),
    clockOutTime: null
  };
}

export async function clockOut(timeEntryId: string): Promise<TimeEntry> {
  const { data, error } = await supabase
    .from('time_entries')
    .update({
      clock_out: new Date().toISOString(),
      is_complete: true
    })
    .eq('id', timeEntryId)
    .select()
    .single();
    
  if (error) throw error;
  
  // Get job code for the returned entry
  const { data: job } = await supabase
    .from('jobs')
    .select('code')
    .eq('id', data.job_id)
    .single();
  
  return {
    id: data.id,
    projectId: data.project_id,
    jobId: data.job_id,
    jobCode: job?.code || '',
    clockInTime: new Date(data.clock_in),
    clockOutTime: new Date(data.clock_out)
  };
}

export async function getActiveTimeEntry(userId: string): Promise<TimeEntry | null> {
  const { data, error } = await supabase
    .from('time_entries')
    .select('*')
    .eq('user_id', userId)
    .eq('is_complete', false)
    .single();
    
  if (error) {
    if (error.code === 'PGRST116') {
      // No active entry found
      return null;
    }
    throw error;
  }
  
  // Get job code for the returned entry
  const { data: job } = await supabase
    .from('jobs')
    .select('code')
    .eq('id', data.job_id)
    .single();
  
  return {
    id: data.id,
    projectId: data.project_id,
    jobId: data.job_id,
    jobCode: job?.code || '',
    clockInTime: new Date(data.clock_in),
    clockOutTime: null
  };
}
