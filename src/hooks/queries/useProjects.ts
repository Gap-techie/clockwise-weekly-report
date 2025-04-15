// src/hooks/useProjects.ts
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabaseClient';


const fetchProjects = async (user) => {
    if (!user) return [];
  
    const { data, error } = await supabase
      .from('projects')
      .select('id, name, description, is_active')
      .eq('is_active', true)
      .order('name');
  
    if (error) throw error;
  
    return data || [];
  };
  // Adjust path as needed

export default function useProjects(user, toast) {
  return useQuery({
    queryKey: ['projects', user?.id],
    queryFn: () => fetchProjects(user),
    enabled: !!user,
    onError: (error) => {
      console.error('Error fetching projects:', error);
      toast({
        title: "Error loading projects",
        description: "Please try again later",
        variant: "destructive"
      });
    },
    staleTime: 5 * 60 * 1000,
  });
}
