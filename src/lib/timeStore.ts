import { create } from 'zustand';
import { Project, TimeEntry, Job, WeeklySummary, DailySummary } from './types';
import { SAMPLE_PROJECTS, SAMPLE_JOBS, SAMPLE_TIME_ENTRIES } from './mockData';
import { calculateWeeklySummary, calculateTodayHours, formatDate } from './timeUtils';

type TimeTrackingState = {
  projects: Project[];
  jobs: Record<string, Job[]>;
  timeEntries: TimeEntry[];
  activeTimeEntry: TimeEntry | null;
  selectedProjectId: string | null;
  selectedJobId: string | null;
  currentWeekDate: Date;
  loading: boolean;
  error: string | null;
  
  // Computed properties and getters
  activeEntry: TimeEntry | null;
  
  // Project actions
  setProjects: (projects: Project[]) => void;
  setJobs: (projectId: string, jobs: Job[]) => void;
  selectProject: (projectId: string) => void;
  selectJob: (jobId: string) => void;
  
  // Time tracking actions
  startTimeEntry: () => void;
  stopTimeEntry: (entryId: string) => void;
  setActiveTimeEntry: (entry: TimeEntry | null) => void;
  clockIn: (projectId: string, jobCode: string) => void;
  clockOut: () => void;
  
  // Weekly activity
  setCurrentWeekDate: (date: Date) => void;
  
  // Stats and summary methods
  getWeeklySummary: () => WeeklySummary;
  getTodayHours: () => number;
  getActiveTimer: () => number;
  
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
  currentWeekDate: new Date(),
  loading: false,
  error: null,
  
  // Computed properties
  get activeEntry() {
    return get().activeTimeEntry;
  },
  
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
    set((state) => {
        const entryIndex = state.timeEntries.findIndex(entry => entry.id === entryId);
        if (entryIndex === -1) return state; // Entry not found

        const updatedEntries = [...state.timeEntries];
        updatedEntries[entryIndex].clockOutTime = new Date(); // Set clock out time
        return { timeEntries: updatedEntries, activeTimeEntry: null }; // Update state
    });
  },
  
  setActiveTimeEntry: (entry) => set({ activeTimeEntry: entry }),
  
  clockIn: (projectId, jobCode) => {
    const newEntry: TimeEntry = {
      id: `entry-${Date.now()}`,
      projectId,
      jobId: "", // This would typically come from the server
      jobCode,
      clockInTime: new Date(),
      clockOutTime: null
    };
    
    set((state) => ({
      timeEntries: [...state.timeEntries, newEntry],
      activeTimeEntry: newEntry,
      error: null
    }));
  },
  
  clockOut: () => {
    const { activeTimeEntry } = get();
    if (!activeTimeEntry) return;
    
    set((state) => ({
      timeEntries: state.timeEntries.map(entry => 
        entry.id === activeTimeEntry.id
          ? { ...entry, clockOutTime: new Date() }
          : entry
      ),
      activeTimeEntry: null
    }));
  },
  
  // Weekly activity
  setCurrentWeekDate: (date) => set({ currentWeekDate: date }),
  
  // Stats and summary methods
  getWeeklySummary: () => {
    const { timeEntries, currentWeekDate } = get();
    return calculateWeeklySummary(timeEntries, currentWeekDate);
  },
  
  getTodayHours: () => {
    const { timeEntries } = get();
    return calculateTodayHours(timeEntries);
  },
  
  getActiveTimer: () => {
    const { activeTimeEntry } = get();
    if (!activeTimeEntry) return 0;
    
    const start = activeTimeEntry.clockInTime instanceof Date 
      ? activeTimeEntry.clockInTime 
      : new Date(activeTimeEntry.clockInTime);
      
    const now = new Date();
    return Math.floor((now.getTime() - start.getTime()) / 1000);
  },
  
  // Loading & error state
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error })
}));
