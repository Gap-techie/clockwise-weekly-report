// src/hooks/useProjects.ts
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabaseClient';


const fetchJobs = async (projectId) => {
  if (!projectId) return [];

  const { data, error } = await supabase
    .from('jobs')
    .select('id, code, is_active')
    .eq('is_active', true)
    .order('code');

  if (error) {
    console.error('Error fetching jobs:', error);
    throw error;
  }

  console.log('Fetched jobs for project:', {
    projectId,
    jobs: data?.map(j => j.code) || []
  });

  return data || [];
};

export function useJobs(selectedProject, toast) {
  return useQuery({
    queryKey: ['jobs', selectedProject],
    queryFn: () => fetchJobs(selectedProject),
    enabled: !!selectedProject, // only run when a project is selected
    onError: (error) => {
      toast({
        title: "Error loading job codes",
        description: "Please try again later",
        variant: "destructive",
      });
    },
    staleTime: 5 * 60 * 1000, // optional: 5 minutes cache
  });
}

