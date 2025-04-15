
import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { useTimeStore } from '@/lib/timeStore';
import { formatTimeDisplay } from '@/lib/timeUtils';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import BreakTimer from './BreakTimer';

const TimeTracker = () => {
  const { 
    activeEntry,
    clockIn: storeClockIn, 
    clockOut: storeClockOut,
    getActiveTimer
  } = useTimeStore();
  
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [jobLoading, setJobLoading] = useState(false);
  const [projects, setProjects] = useState<{id: string; name: string}[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [jobCode, setJobCode] = useState<string>('');
  const [timer, setTimer] = useState(0);
  
  // Fetch projects from database
  useEffect(() => {
    async function fetchProjects() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('projects')
          .select('id, name')
          .eq('is_active', true)
          .order('name');
          
        if (error) throw error;
        
        setProjects(data || []);
      } catch (error) {
        console.error('Error fetching projects:', error);
        toast({
          title: "Error loading projects",
          description: "Please try again later",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    }
    
    fetchProjects();
  }, [toast]);
  
  // Check for active time entry
  useEffect(() => {
    async function checkActiveEntry() {
      if (!user) return;
      
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('time_entries')
          .select('id, project_id, job_id')
          .eq('user_id', user.id)
          .eq('is_complete', false)
          .maybeSingle();
          
        if (error) throw error;
        
        if (data) {
          // Get the job code for the active entry
          const { data: jobData } = await supabase
            .from('jobs')
            .select('code')
            .eq('id', data.job_id)
            .single();
            
          if (jobData) {
            storeClockIn(data.project_id, jobData.code);
            setSelectedProject(data.project_id);
            setJobCode(jobData.code);
          }
        }
      } catch (error) {
        console.error('Error checking active entry:', error);
      } finally {
        setLoading(false);
      }
    }
    
    if (user) {
      checkActiveEntry();
    }
  }, [user, storeClockIn]);
  
  // Update timer for active time entry
  useEffect(() => {
    if (!activeEntry) {
      setTimer(0);
      return;
    }
    
    setTimer(getActiveTimer());
    
    const interval = setInterval(() => {
      setTimer(getActiveTimer());
    }, 1000);
    
    return () => clearInterval(interval);
  }, [activeEntry, getActiveTimer]);
  
  // Validate job code against database
  const validateJobCode = async (projectId: string, code: string): Promise<string | null> => {
    try {
      setJobLoading(true);
      
      if (!code.trim()) {
        return "Job code is required";
      }
      
      // Check if job code exists for the selected project
      const { data, error } = await supabase
        .from('jobs')
        .select('id')
        .eq('project_id', projectId)
        .eq('code', code.trim())
        .eq('is_active', true)
        .maybeSingle();
        
      if (error) throw error;
      
      if (!data) {
        return "Invalid job code. Please enter a valid code for this project.";
      }
      
      return null; // No error, job code is valid
    } catch (error) {
      console.error('Error validating job code:', error);
      return "Error validating job code. Please try again.";
    } finally {
      setJobLoading(false);
    }
  };
  
  const handleClockInOut = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to use the time tracker",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    
    try {
      if (activeEntry) {
        // Clock Out Logic
        const { error } = await supabase
          .from('time_entries')
          .update({
            clock_out: new Date().toISOString(),
            is_complete: true
          })
          .eq('id', activeEntry.id);
          
        if (error) throw error;
        
        storeClockOut();
        setSelectedProject('');
        setJobCode('');
        
        toast({
          title: "Clocked Out",
          description: "Your time has been recorded"
        });
      } else {
        // Clock In Logic
        if (!selectedProject) {
          toast({
            title: "Project Required",
            description: "Please select a project",
            variant: "destructive"
          });
          setLoading(false);
          return;
        }
        
        // Validate job code
        const validationError = await validateJobCode(selectedProject, jobCode);
        if (validationError) {
          toast({
            title: "Invalid Job Code",
            description: validationError,
            variant: "destructive"
          });
          setLoading(false);
          return;
        }
        
        // Get job_id from code
        const { data: jobData, error: jobError } = await supabase
          .from('jobs')
          .select('id')
          .eq('project_id', selectedProject)
          .eq('code', jobCode.trim())
          .single();
          
        if (jobError) throw jobError;
        
        // Create time entry
        const { data, error } = await supabase
          .from('time_entries')
          .insert({
            user_id: user.id,
            project_id: selectedProject,
            job_id: jobData.id,
            clock_in: new Date().toISOString(),
            is_complete: false
          })
          .select()
          .single();
          
        if (error) throw error;
        
        storeClockIn(selectedProject, jobCode);
        
        toast({
          title: "Clocked In",
          description: "Time tracking has started"
        });
      }
    } catch (error) {
      console.error('Error during clock in/out:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="bg-white p-5 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Time Tracker</h2>
        <div className="text-2xl font-mono">{formatTimeDisplay(timer)}</div>
      </div>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="project" className="block text-sm font-medium mb-1">
            Select Project
          </label>
          <Select
            disabled={!!activeEntry || loading}
            value={selectedProject}
            onValueChange={setSelectedProject}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a project" />
            </SelectTrigger>
            <SelectContent>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label htmlFor="jobCode" className="block text-sm font-medium mb-1">
            Enter Job Code
          </label>
          <Input 
            id="jobCode"
            placeholder="Enter job code"
            value={jobCode}
            onChange={(e) => setJobCode(e.target.value)}
            disabled={!!activeEntry || loading}
          />
        </div>
        
        <Button
          className="w-full py-6"
          onClick={handleClockInOut}
          disabled={loading || jobLoading || (!activeEntry && (!selectedProject || !jobCode))}
          variant={activeEntry ? "destructive" : "default"}
        >
          <Clock className="mr-2 h-5 w-5" />
          {loading ? 'Processing...' : activeEntry ? 'Clock Out' : 'Clock In'}
        </Button>
        
        {activeEntry && (
          <BreakTimer 
            timeEntryId={activeEntry.id}
            disabled={loading}
          />
        )}
      </div>
    </div>
  );
};

export default TimeTracker;
