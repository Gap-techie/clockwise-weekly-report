
import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { useTimeStore } from '@/lib/timeStore';
import { formatTimeDisplay } from '@/lib/timeUtils';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

const TimeTracker = () => {
  const { 
    projects, 
    activeEntry,
    clockIn, 
    clockOut,
    getActiveTimer
  } = useTimeStore();
  
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [jobCode, setJobCode] = useState<string>('');
  const [timer, setTimer] = useState(0);
  
  // Update timer every second if there's an active entry
  useEffect(() => {
    if (!activeEntry) {
      setTimer(0);
      return;
    }
    
    // Set initial value
    setTimer(getActiveTimer());
    
    // Update each second
    const interval = setInterval(() => {
      setTimer(getActiveTimer());
    }, 1000);
    
    return () => clearInterval(interval);
  }, [activeEntry, getActiveTimer]);
  
  // Pre-populate form if there's an active entry
  useEffect(() => {
    if (activeEntry) {
      setSelectedProject(activeEntry.projectId);
      setJobCode(activeEntry.jobCode);
    }
  }, [activeEntry]);
  
  const handleClockInOut = () => {
    if (activeEntry) {
      clockOut();
      // Reset form
      setSelectedProject('');
      setJobCode('');
    } else {
      if (!selectedProject) return;
      clockIn(selectedProject, jobCode);
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
            disabled={!!activeEntry}
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
            disabled={!!activeEntry}
          />
        </div>
        
        <Button
          className="w-full py-6"
          onClick={handleClockInOut}
          disabled={!activeEntry && !formIsValid}
          variant={activeEntry ? "destructive" : "default"}
        >
          <Clock className="mr-2 h-5 w-5" />
          {activeEntry ? 'Clock Out' : 'Clock In'}
        </Button>
      </div>
    </div>
  );
};

export default TimeTracker;
