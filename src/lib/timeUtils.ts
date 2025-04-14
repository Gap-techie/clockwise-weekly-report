
import { DailySummary, TimeEntry, WeeklySummary } from "./types";
import { format, addDays, startOfWeek, endOfWeek, differenceInSeconds, isWithinInterval, parseISO } from "date-fns";

// Format time as HH:MM:SS
export function formatTimeDisplay(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  
  return `${padZero(hours)}:${padZero(minutes)}:${padZero(remainingSeconds)}`;
}

// Format time as decimal hours
export function formatHours(seconds: number): string {
  const hours = (seconds / 3600).toFixed(1);
  return `${hours} hrs`;
}

// Format date as YYYY-MM-DD
export function formatDate(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

// Format date for display
export function formatDateDisplay(date: Date): string {
  return format(date, "MMM d, yyyy");
}

// Format time for display
export function formatTimeForDisplay(date: Date): string {
  return format(date, "h:mm a");
}

// Get week range string
export function getWeekRangeString(date: Date): string {
  const start = startOfWeek(date, { weekStartsOn: 1 });
  const end = endOfWeek(date, { weekStartsOn: 1 });
  return `${format(start, "MMM d, yyyy")} - ${format(end, "MMM d, yyyy")}`;
}

// Calculate duration between two dates in seconds
export function calculateDurationInSeconds(start: Date, end: Date): number {
  return differenceInSeconds(end, start);
}

// Calculate hours from seconds
export function calculateHours(seconds: number): number {
  return parseFloat((seconds / 3600).toFixed(2));
}

// Create an array of dates for a week
export function getDatesForWeek(date: Date): Date[] {
  const startDate = startOfWeek(date, { weekStartsOn: 1 });
  const dates = [];
  
  for (let i = 0; i < 7; i++) {
    dates.push(addDays(startDate, i));
  }
  
  return dates;
}

// Calculate weekly summary from time entries
export function calculateWeeklySummary(entries: TimeEntry[], date: Date): WeeklySummary {
  const weekStart = startOfWeek(date, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(date, { weekStartsOn: 1 });
  
  const weekInterval = { start: weekStart, end: weekEnd };
  const days: { [isoDate: string]: DailySummary } = {};
  
  // Initialize days
  const weekDates = getDatesForWeek(date);
  weekDates.forEach((date) => {
    const isoDate = formatDate(date);
    days[isoDate] = {
      date,
      regularHours: 0,
      overtimeHours: 0,
      totalHours: 0
    };
  });
  
  // Process entries
  let regularHours = 0;
  let overtimeHours = 0;
  let totalHours = 0;
  
  entries.forEach((entry) => {
    if (!entry.clockOutTime) return;
    
    const entryStart = entry.clockInTime;
    const entryEnd = entry.clockOutTime;
    
    if (isWithinInterval(entryStart, weekInterval) || isWithinInterval(entryEnd, weekInterval)) {
      const duration = calculateDurationInSeconds(entryStart, entryEnd);
      const hours = calculateHours(duration);
      const entryDate = formatDate(entryStart);
      
      // Add to day totals if the day exists in our week
      if (days[entryDate]) {
        days[entryDate].totalHours += hours;
        
        // Determine regular vs overtime (over 8 hours per day is overtime)
        if (days[entryDate].totalHours <= 8) {
          days[entryDate].regularHours += hours;
        } else {
          const remainingRegular = Math.max(0, 8 - (days[entryDate].totalHours - hours));
          const overtime = hours - remainingRegular;
          
          days[entryDate].regularHours += remainingRegular;
          days[entryDate].overtimeHours += overtime;
        }
      }
    }
  });
  
  // Calculate weekly totals
  Object.values(days).forEach((day) => {
    regularHours += day.regularHours;
    overtimeHours += day.overtimeHours;
    totalHours += day.totalHours;
  });
  
  return {
    startDate: weekStart,
    endDate: weekEnd,
    days,
    regularHours,
    overtimeHours,
    totalHours
  };
}

// Get today's hours from time entries
export function calculateTodayHours(entries: TimeEntry[]): number {
  const today = new Date();
  const todayDateStr = formatDate(today);
  
  return entries.reduce((total, entry) => {
    if (!entry.clockOutTime) return total;
    
    const entryDate = formatDate(entry.clockInTime);
    if (entryDate === todayDateStr) {
      const duration = calculateDurationInSeconds(entry.clockInTime, entry.clockOutTime);
      return total + calculateHours(duration);
    }
    return total;
  }, 0);
}

function padZero(num: number): string {
  return num.toString().padStart(2, "0");
}
