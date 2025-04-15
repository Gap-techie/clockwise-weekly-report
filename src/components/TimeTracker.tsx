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
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import BreakTimer from './BreakTimer';
import useProjects from '../hooks/queries/useProjects';
import { useJobs } from '../hooks/queries/useJobs';
import validateJobCode from '@/utils/validateJobCode';
import { TimeEntry } from '@/types/timeTracker';


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
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [jobCode, setJobCode] = useState<string>('');
  const [timer, setTimer] = useState(0);
  const [currentTimeEntry, setCurrentTimeEntry] = useState<TimeEntry | null>(null);

  const { data: projects = [], isLoading: isProjectLoading } = useProjects(user, toast);
  const { data: jobs = [], isLoading: isJobLoading } = useJobs(selectedProject, toast);
  
  // Check for active time entry
  useEffect(() => {
    async function checkActiveEntry() {
      if (!user) return;
      
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('time_entries')
          .select(`
            id,
            project_id,
            job_id,
            clock_in,
            clock_out,
            is_complete,
            jobs!inner (
              code
            )
          `)
          .eq('user_id', user.id)
          .eq('is_complete', false)
          .maybeSingle();
          
        if (error) {
          console.error('Error checking active entry:', error);
          toast({
            title: "Error checking time entry",
            description: "Please try again later",
            variant: "destructive"
          });
          return;
        }
        
        if (data) {
          setCurrentTimeEntry(data);
          storeClockIn(data.project_id, data.jobs.code);
          setSelectedProject(data.project_id);
          setJobCode(data.jobs.code);
        }
      } catch (error) {
        console.error('Error checking active entry:', error);
        toast({
          title: "Error checking time entry",
          description: "Please try again later",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    }
    
    if (user) {
      checkActiveEntry();
    }
  }, [user, storeClockIn, toast]);
  
  // Update timer for active time entry
  useEffect(() => {
    if (!currentTimeEntry) {
      setTimer(0);
      return;
    }
    
    setTimer(getActiveTimer());
    
    const interval = setInterval(() => {
      setTimer(getActiveTimer());
    }, 1000);
    
    return () => clearInterval(interval);
  }, [currentTimeEntry, getActiveTimer]);
  
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
      if (currentTimeEntry) {
        console.log('Clocking out:', currentTimeEntry);
        // Clock Out Logic
        const now = new Date().toISOString();
        
        // Update time entry
        const { error: updateError } = await supabase
          .from('time_entries')
          .update({
            clock_out: now,
            is_complete: true
          })
          .eq('id', currentTimeEntry.id)
          .eq('user_id', user.id); // Add user_id check for security
          
        if (updateError) throw updateError;
        
        // Create daily summary entry
        const { error: summaryError } = await supabase
          .from('daily_summaries')
          .upsert({
            user_id: user.id,
            project_id: currentTimeEntry.project_id,
            job_id: currentTimeEntry.job_id,
            date: now.split('T')[0],
            day_of_week: new Date().getDay(),
            regular_hours: timer / 3600,
            overtime_hours: 0,
            total_hours: timer / 3600,
            created_at: now
          })
          .select();
          
        if (summaryError) throw summaryError;
        
        setCurrentTimeEntry(null);
        await storeClockOut();
        setSelectedProject('');
        setJobCode('');
        
        toast({
          title: "Clocked Out Successfully",
          description: "You have been clocked out. You can now clock in again.",
          duration: 3000
        });
      } else {
        console.log('Clocking inxxxx:', {
          selectedProject,
          jobCode: jobCode.trim()
        });
        // Clock In Logic
        if (!selectedProject || !jobCode.trim()) {
          toast({
            title: "Missing Information",
            description: "Please select a project and enter a job code",
            variant: "destructive"
          });
          setLoading(false);
          return;
        }

        console.log('Starting clock in process:', {
          projectId: selectedProject,
          jobCode: jobCode.trim(),
          timestamp: new Date().toISOString()
        });
        
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
        
        // Get job_id with case-insensitive comparison
        const { data: jobData, error: jobError } = await supabase
          .from('jobs')
          .select('id, code')
          .ilike('code', jobCode.trim())
          .eq('is_active', true)
          .single();
          
        if (jobError) {
          console.error('Error fetching job:', jobError);
          throw new Error('Could not find job code. Please try again.');
        }
        
        if (!jobData) {
          toast({
            title: "Invalid Job Code",
            description: "Could not find the specified job code for this project.",
            variant: "destructive"
          });
          setLoading(false);
          return;
        }

        console.log('Found job for clock in:', {
          jobId: jobData.id,
          jobCode: jobData.code
        });
        
        // Create time entry
        console.log('Creating time entry:', {
          user_id: user.id,
          project_id: selectedProject,
          job_id: jobData.id,
          clock_in: new Date().toISOString(),
          is_complete: false
        });
        const { data: entryData, error: entryError } = await supabase
          .from('time_entries')
          .insert({
            user_id: user.id,
            project_id: selectedProject,
            job_id: jobData.id,
            clock_in: new Date().toISOString(),
            is_complete: false
          })
          .select(`
            id,
            user_id,
            project_id,
            job_id,
            clock_in,
            is_complete,
            jobs!inner (
              code
            )
          `)
          .single();

        console.log('Time entry created:', entryData);
        if (entryError) {
          console.error('Error creating time entry:', entryError);
          if (entryError.code === '42P01') {
            toast({
              title: "Database Error",
              description: "There was an issue with the database policy. Please contact support.",
              variant: "destructive"
            });
          } else {
            throw entryError;
          }
          return;
        }
        
        if (!entryData) {
          throw new Error('No data returned from time entry creation');
        }

        console.log('Successfully created time entry:', {
          entryId: entryData.id,
          projectId: entryData.project_id,
          jobCode: entryData.jobs.code
        });
        
        setCurrentTimeEntry(entryData as TimeEntry);
        storeClockIn(selectedProject, jobCode);
        
        toast({
          title: "Clocked In Successfully",
          description: "Time tracking has started. You can now clock out when needed.",
          duration: 3000
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
            disabled={!!currentTimeEntry || loading}
            value={selectedProject}
            onValueChange={(value) => {
              setSelectedProject(value);
              setJobCode(''); // Clear job code when project changes
            }}
          >
            <SelectTrigger 
              className={cn(
                "transition-colors duration-200",
                currentTimeEntry ? "bg-gray-100 cursor-not-allowed" : "bg-white hover:bg-gray-50"
              )}
            >
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
            onChange={(e) => setJobCode(e.target.value.toUpperCase())} // Convert to uppercase
            disabled={!!currentTimeEntry || loading || !selectedProject} // Disable if no project selected
            className={cn(
              "transition-colors duration-200",
              currentTimeEntry ? "bg-gray-100 cursor-not-allowed" : 
              !selectedProject ? "bg-gray-50 cursor-not-allowed" :
              "bg-white hover:bg-gray-50"
            )}
          />
          {selectedProject && jobs.length > 0 && !currentTimeEntry && (
            <div className="mt-1 text-sm text-gray-500">
              Available codes: {jobs.map(job => job.code).join(', ')}
            </div>
          )}
        </div>
        
        <Button
          className={cn(
            "w-full py-6 transition-colors duration-200",
            currentTimeEntry 
              ? "bg-red-500 hover:bg-red-600 text-white" 
              : "bg-emerald-500 hover:bg-emerald-600 text-white"
          )}
          onClick={handleClockInOut}
          disabled={
            loading || 
            jobLoading || 
            (!currentTimeEntry && (!selectedProject || !jobCode)) ||
            (!currentTimeEntry && !selectedProject)
          }
        >
          <Clock className="mr-2 h-5 w-5" />
          {loading ? 'Processing...' : currentTimeEntry ? 'Clock Out' : 'Clock In'}
        </Button>
        
        {currentTimeEntry && (
          <BreakTimer 
            timeEntryId={currentTimeEntry.id}
            disabled={loading}
          />
        )}
      </div>
    </div>
  );
};

export default TimeTracker;
