
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { TimeEntry, Project, WeeklySummary } from './types';
import { calculateWeeklySummary, calculateTodayHours } from './timeUtils';
import { mockProjects, generateMockTimeEntries } from './mockData';

interface TimeState {
  // Data
  projects: Project[];
  timeEntries: TimeEntry[];
  activeEntry: TimeEntry | null;
  currentWeekDate: Date;
  
  // Actions
  addProject: (project: Project) => void;
  clockIn: (projectId: string, jobCode: string) => void;
  clockOut: () => void;
  deleteTimeEntry: (id: string) => void;
  updateTimeEntry: (id: string, updates: Partial<TimeEntry>) => void;
  setCurrentWeekDate: (date: Date) => void;
  
  // Computed data
  getActiveTimer: () => number;
  getWeeklySummary: () => WeeklySummary;
  getTodayHours: () => number;
}

export const useTimeStore = create<TimeState>()(
  persist(
    (set, get) => ({
      // Initial state
      projects: mockProjects,
      timeEntries: generateMockTimeEntries(),
      activeEntry: null,
      currentWeekDate: new Date(),
      
      // Actions
      addProject: (project) => {
        set((state) => ({
          projects: [...state.projects, project]
        }));
      },
      
      clockIn: (projectId, jobCode) => {
        const newEntry: TimeEntry = {
          id: `entry-${Date.now()}`,
          projectId,
          jobCode,
          clockInTime: new Date(),
          clockOutTime: null,
        };
        
        set((state) => ({
          activeEntry: newEntry,
          timeEntries: [...state.timeEntries, newEntry]
        }));
      },
      
      clockOut: () => {
        const { activeEntry, timeEntries } = get();
        
        if (!activeEntry) return;
        
        const updatedEntries = timeEntries.map((entry) => 
          entry.id === activeEntry.id
            ? { ...entry, clockOutTime: new Date() }
            : entry
        );
        
        set({
          activeEntry: null,
          timeEntries: updatedEntries
        });
      },
      
      deleteTimeEntry: (id) => {
        set((state) => ({
          timeEntries: state.timeEntries.filter((entry) => entry.id !== id)
        }));
      },
      
      updateTimeEntry: (id, updates) => {
        set((state) => ({
          timeEntries: state.timeEntries.map((entry) => 
            entry.id === id ? { ...entry, ...updates } : entry
          )
        }));
      },
      
      setCurrentWeekDate: (date) => {
        set({ currentWeekDate: date });
      },
      
      // Computed values
      getActiveTimer: () => {
        const { activeEntry } = get();
        
        if (!activeEntry) return 0;
        
        const elapsed = Math.floor((new Date().getTime() - activeEntry.clockInTime.getTime()) / 1000);
        return elapsed;
      },
      
      getWeeklySummary: () => {
        const { timeEntries, currentWeekDate } = get();
        return calculateWeeklySummary(timeEntries, currentWeekDate);
      },
      
      getTodayHours: () => {
        const { timeEntries } = get();
        return calculateTodayHours(timeEntries);
      },
    }),
    {
      name: 'clockwise-time-storage',
    }
  )
);
