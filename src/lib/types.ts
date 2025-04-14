
export interface TimeEntry {
  id: string;
  projectId: string;
  jobCode: string;
  clockInTime: Date;
  clockOutTime: Date | null;
}

export interface Project {
  id: string;
  name: string;
}

export interface WeeklyTimeData {
  [day: string]: {
    [projectJobKey: string]: number; // Hours as decimal
  };
}

export interface DailySummary {
  date: Date;
  regularHours: number;
  overtimeHours: number;
  totalHours: number;
}

export interface WeeklySummary {
  startDate: Date;
  endDate: Date;
  days: { [isoDate: string]: DailySummary };
  regularHours: number;
  overtimeHours: number;
  totalHours: number;
}
