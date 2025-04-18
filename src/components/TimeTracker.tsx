import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { useTimeStore } from '@/lib/timeStore';
import { formatTimeDisplay } from '@/lib/timeUtils';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { toast, useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import { cn } from '@/lib/utils';
import BreakTimer from './BreakTimer';
import useProjects from '../hooks/queries/useProjects';
import { useJobs } from '../hooks/queries/useJobs';
import validateJobCode from '@/utils/validateJobCode';
import { TimeEntry } from '@/types/timeTracker';
import { fetchActiveJobByCode } from '@/lib/supabase/jobs';
import { createTimeEntry, createDailySummary } from '@/lib/supabase/timeEntries';
import type { User } from '@supabase/supabase-js';
import { calculateBreakDeduction } from '@/lib/supabase/breaks';

interface Project {
  id: string;
  name: string;
}

interface Job {
  id: string;
  code: string;
}

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
  const [totalBreakMinutes, setTotalBreakMinutes] = useState(0);

  const { data: projects = [], isLoading: isProjectLoading } = useProjects(user, toast) as { data: Project[], isLoading: boolean };
  const { data: jobs = [], isLoading: isJobLoading } = useJobs(selectedProject, toast) as { data: Job[], isLoading: boolean };

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
            user_id,
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
        await handleClockOut(user, currentTimeEntry);
        return;
      }

      await handleClockIn(user, selectedProject, jobCode);
    } catch (err: any) {
      handleClockError(err);
    } finally {
      setLoading(false);
    }
  };
  // 🔽 Clock Out Logic
  const handleClockOut = async (user: User, entry: TimeEntry) => {
    const now = new Date().toISOString();
    const today = now.split('T')[0];

    console.log('Clocking out:', entry);

    const { error: updateError } = await supabase
      .from('time_entries')
      .update({ clock_out: now, is_complete: true })
      .eq('id', entry.id)
      .eq('user_id', user.id);

    if (updateError) throw updateError;

    const { regularHours, overtimeHours, totalHours } = calculateWorkedHours(entry, now);

    await dailySummarypayload(user, entry, regularHours, overtimeHours, totalHours, today);
    await resetClockOutState(storeClockOut, setCurrentTimeEntry, setSelectedProject, setJobCode);

    toast({
      title: "Clocked Out Successfully",
      description: "You have been clocked out. You can now clock in again.",
      duration: 3000
    });
  };

  // 🔽 Clock In Logic
  const handleClockIn = async (user: User, projectId: string, jobCode: string) => {
    const jobData = await fetchActiveJobByCode(jobCode);
    if (!jobData) throw new Error("Invalid Job Code");

    console.log('Found job for clock in:', { jobId: jobData.id, jobCode: jobData.code });

    const entryData = await createTimeEntry({
      userId: user.id,
      projectId,
      jobId: jobData.id
    });

    console.log('Time entry created:', entryData);

    const completeTimeEntry: TimeEntry = {
      ...entryData,
      jobs: { code: jobData.code }
    };

    setCurrentTimeEntry(completeTimeEntry);
    await storeClockIn(projectId, jobData.code);

    toast({
      title: "Clocked In Successfully",
      description: "Time tracking has started. You can now clock out when needed.",
      duration: 3000
    });
  };

  // 🔽 Centralized error handler
  const handleClockError = (err: any) => {
    console.error('Clock In/Out Error:', err);

    if (err.message === 'Invalid Job Code') {
      toast({
        title: "Invalid Job Code",
        description: "Could not find the specified job code for this project.",
        variant: "destructive"
      });
    } else if (err.code === '42P01' || err.code === '42P17') {
      toast({
        title: "Database Error",
        description: "There was an issue with the database policy. Please contact support.",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Operation Failed",
        description: err.message || "Something went wrong. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Calculate actual working hours (excluding breaks)
  const calculateActualWorkingHours = () => {
    if (!currentTimeEntry?.clock_in) return 0;
    
    const startTime = new Date(currentTimeEntry.clock_in);
    const endTime = currentTimeEntry.clock_out ? new Date(currentTimeEntry.clock_out) : new Date();
    
    // Calculate total duration in minutes
    const totalMinutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60);
    
    // Subtract break time, but only deduct time beyond the 30-minute daily compensation
    const deductibleBreakMinutes = Math.max(0, totalBreakMinutes - 30);
    
    // Convert to hours
    return (totalMinutes - deductibleBreakMinutes) / 60;
  };

  // Handle break updates
  const handleBreakUpdate = (breakMinutes: number) => {
    setTotalBreakMinutes(breakMinutes);
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
            isTimeEntryActive={!!currentTimeEntry && !currentTimeEntry.is_complete}
            disabled={loading}
            userId={user.id}
            onBreakUpdate={handleBreakUpdate}
          />
        )}

        {/* Display working hours */}
        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-700">Working Hours Summary</h3>
          <div className="mt-2 space-y-2 text-sm text-gray-600">
            <p>Total Time: {calculateActualWorkingHours().toFixed(2)} hours</p>
            <p>Total Break Time: {(totalBreakMinutes / 60).toFixed(2)} hours</p>
            <p className="text-xs text-gray-500">
              (30 minutes of break time compensated daily)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeTracker;


async function resetClockOutState(storeClockOut: () => void, setCurrentTimeEntry, setSelectedProject, setJobCode) {
  await storeClockOut();
  setCurrentTimeEntry(null);
  setSelectedProject('');
  setJobCode('');
}

async function dailySummarypayload(user, currentTimeEntry: TimeEntry, regularHours: number, overtimeHours: number, totalHours: number, today: string) {
  await createDailySummary({
    userId: user.id,
    projectId: currentTimeEntry.project_id,
    jobId: currentTimeEntry.job_id,
    regularHours: Number(regularHours.toFixed(2)),
    overtimeHours: Number(overtimeHours.toFixed(2)),
    totalHours: Number(totalHours.toFixed(2)),
    date: today
  });
}

function calculateWorkedHours(currentTimeEntry: TimeEntry, now: string) {
  const clockInTime = new Date(currentTimeEntry.clock_in).getTime();
  const clockOutTime = new Date(now).getTime();
  const totalHours = (clockOutTime - clockInTime) / (1000 * 60 * 60);
  const regularHours = Math.min(totalHours, 8);
  const overtimeHours = Math.max(0, totalHours - 8);
  return { regularHours, overtimeHours, totalHours };
}

function validateClockInInputs(project: string, code: string): boolean {
  console.log('Clocking in:', {
    selectedProject: project,
    jobCode: code.trim()
  });

  if (!project || !code.trim()) {
    toast({
      title: "Missing Information",
      description: "Please select a project and enter a job code",
      variant: "destructive"
    });
    return false;
  }

  return true;
}

const handleClockIn = async (selectedProject: string, jobCode: string) => {
  if (!validateClockInInputs(selectedProject, jobCode)) return;

  const validationError = await validateJobCode(selectedProject, jobCode);
  if (validationError) {
    toast({
      title: "Invalid Job Code",
      description: validationError,
      variant: "destructive"
    });
    return;
  }
};


