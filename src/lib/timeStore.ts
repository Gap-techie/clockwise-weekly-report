
import { create } from 'zustand';
import { Project, TimeEntry, Job } from './types';
import { SAMPLE_PROJECTS, SAMPLE_JOBS, SAMPLE_TIME_ENTRIES } from './mockData';

type TimeTrackingState = {
  projects: Project[];
  jobs: Record<string, Job[]>;
  timeEntries: TimeEntry[];
  activeTimeEntry: TimeEntry | null;
  selectedProjectId: string | null;
  selectedJobId: string | null;
  loading: boolean;
  error: string | null;
  
  // Project actions
  setProjects: (projects: Project[]) => void;
  setJobs: (projectId: string, jobs: Job[]) => void;
  selectProject: (projectId: string) => void;
  selectJob: (jobId: string) => void;
  
  // Time tracking actions
  startTimeEntry: () => void;
  stopTimeEntry: (entryId: string) => void;
  setActiveTimeEntry: (entry: TimeEntry | null) => void;
  
  // Loading & error state
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
};

export const useTimeStore = create<TimeTrackingState>((set, get) => ({
  projects: SAMPLE_PROJECTS,
  jobs: SAMPLE_JOBS,
  timeEntries: SAMPLE_TIME_ENTRIES,
  activeTimeEntry: SAMPLE_TIME_ENTRIES.find(entry => entry.clockOutTime === null) || null,
  selectedProjectId: null,
  selectedJobId: null,
  loading: false,
  error: null,
  
  // Project actions
  setProjects: (projects) => set({ projects }),
  setJobs: (projectId, jobs) => set((state) => ({ 
    jobs: { ...state.jobs, [projectId]: jobs } 
  })),
  selectProject: (projectId) => set({ 
    selectedProjectId: projectId,
    selectedJobId: null
  }),
  selectJob: (jobId) => set({ selectedJobId: jobId }),
  
  // Time tracking actions
  startTimeEntry: () => {
    const { selectedProjectId, selectedJobId, jobs } = get();
    
    if (!selectedProjectId || !selectedJobId) {
      set({ error: "Please select a project and job" });
      return;
    }
    
    const jobCode = 
      jobs[selectedProjectId]?.find(j => j.id === selectedJobId)?.code || "";
    
    const newEntry: TimeEntry = {
      id: `entry-${Date.now()}`,
      projectId: selectedProjectId,
      jobId: selectedJobId,
      jobCode: jobCode,
      clockInTime: new Date(),
      clockOutTime: null
    };
    
    set((state) => ({
      timeEntries: [...state.timeEntries, newEntry],
      activeTimeEntry: newEntry,
      error: null
    }));
  },
  
  stopTimeEntry: (entryId) => {
    set((state) => ({
      timeEntries: state.timeEntries.map(entry => 
        entry.id === entryId
          ? { ...entry, clockOutTime: new Date() }
          : entry
      ),
      activeTimeEntry: null
    }));
  },
  
  setActiveTimeEntry: (entry) => set({ activeTimeEntry: entry }),
  
  // Loading & error state
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error })
}));
