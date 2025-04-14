
import { Project, TimeEntry } from "./types";
import { subDays, subHours, addHours } from "date-fns";

export const mockProjects: Project[] = [
  { id: "1", name: "Website Redesign" },
  { id: "2", name: "Mobile App Development" },
  { id: "3", name: "Server Maintenance" },
  { id: "4", name: "Client Meeting" },
  { id: "5", name: "Documentation" },
];

// Generate some mock time entries for demo purposes
export function generateMockTimeEntries(): TimeEntry[] {
  const today = new Date();
  const entries: TimeEntry[] = [];
  
  // Generate entries for the past week
  for (let i = 7; i >= 0; i--) {
    const day = subDays(today, i);
    
    // 1-3 entries per day
    const entriesPerDay = Math.floor(Math.random() * 3) + 1;
    
    for (let j = 0; j < entriesPerDay; j++) {
      const projectId = mockProjects[Math.floor(Math.random() * mockProjects.length)].id;
      const jobCode = `JOB-${100 + Math.floor(Math.random() * 900)}`;
      
      // Random start time during work hours
      const startHour = 9 + Math.floor(Math.random() * 4); // 9am to 1pm
      const clockInTime = new Date(day);
      clockInTime.setHours(startHour, Math.floor(Math.random() * 60), 0);
      
      // Random duration between 1 and 4 hours
      const durationHours = 1 + Math.floor(Math.random() * 3);
      const clockOutTime = addHours(clockInTime, durationHours);
      
      entries.push({
        id: `entry-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        projectId,
        jobCode,
        clockInTime,
        clockOutTime,
      });
    }
  }
  
  // Add one active entry (currently clocked in)
  const activeProject = mockProjects[Math.floor(Math.random() * mockProjects.length)].id;
  const activeJobCode = `JOB-${100 + Math.floor(Math.random() * 900)}`;
  const activeStartTime = subHours(new Date(), 2); // Started 2 hours ago
  
  entries.push({
    id: `active-${Date.now()}`,
    projectId: activeProject,
    jobCode: activeJobCode,
    clockInTime: activeStartTime,
    clockOutTime: null, // Null indicates currently active
  });
  
  return entries;
}
