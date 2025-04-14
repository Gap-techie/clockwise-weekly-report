import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { useTimeStore } from '@/lib/timeStore';
import { formatTimeDisplay } from '@/lib/timeUtils';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { getProjects, clockIn, clockOut, getActiveTimeEntry } from '@/api/timeTracking';
import BreakTimer from './BreakTimer';

const TimeTracker = () => {
  const { 
    projects: storeProjects, 
    activeEntry,
    clockIn: storeClockIn, 
    clockOut: storeClockOut,
    getActiveTimer
  } = useTimeStore();
  
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState(storeProjects);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [jobCode, setJobCode] = useState<string>('');
  const [timer, setTimer] = useState(0);
  
  useEffect(() => {
    async function loadProjects() {
      try {
        const projectsData = await getProjects();
        setProjects(projectsData);
      } catch (error) {
        console.error('Error loading projects:', error);
        toast({
          title: "Error loading projects",
          description: "Please try again later",
          variant: "destructive"
        });
      }
    }
    
    loadProjects();
  }, [toast]);
  
  useEffect(() => {
    async function checkActiveEntry() {
      try {
        const userId = "current-user-id";
        const entry = await getActiveTimeEntry(userId);
        
        if (entry) {
          storeClockIn(entry.projectId, entry.jobCode);
        }
      } catch (error) {
        console.error('Error checking active entry:', error);
      }
    }
    
    checkActiveEntry();
  }, [storeClockIn]);
  
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
  
  useEffect(() => {
    if (activeEntry) {
      setSelectedProject(activeEntry.projectId);
      setJobCode(activeEntry.jobCode);
    }
  }, [activeEntry]);
  
  const handleClockInOut = async () => {
    setLoading(true);
    
    try {
      if (activeEntry) {
        await clockOut(activeEntry.id);
        storeClockOut();
        setSelectedProject('');
        setJobCode('');
        
        toast({
          title: "Clocked Out",
          description: "Your time has been recorded"
        });
      } else {
        if (!selectedProject) return;
        
        const userId = "current-user-id";
        
        const entry = await clockIn(userId, selectedProject, jobCode);
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
  
  const formIsValid = !activeEntry && selectedProject !== '';
  
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
          disabled={((!activeEntry && !formIsValid) || loading)}
          variant={activeEntry ? "destructive" : "default"}
        >
          <Clock className="mr-2 h-5 w-5" />
          {activeEntry ? 'Clock Out' : 'Clock In'}
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
