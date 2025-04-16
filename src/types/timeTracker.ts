export interface Project {
    id: string;
    name: string;
    description: string;
    is_active: boolean;
  }
  
  export interface Job {
    id: string;
    code: string;
    title: string;
    project_id: string;
    is_active: boolean;
  }
  
  export interface Break {
    id: string;
    time_entry_id: string;
    start_time: string;
    end_time: string | null;
    is_complete: boolean;
    created_at: string;
  }
  
  export interface TimeEntry {
    id: string;
    user_id: string;
    project_id: string;
    job_id: string;
    clock_in: string;
    clock_out: string | null;
    is_complete: boolean;
    notes?: string;
    jobs: {
      code: string;
    };
    breaks?: Break[];
  }
  
  export interface DailySummary {
    id?: string;
    user_id: string;
    date: string;
    day_of_week: number;
    project_id?: string;
    job_id?: string;
    regular_hours: number;
    overtime_hours: number;
    total_hours: number;
    break_time: number;
    created_at?: string;
  }
  
  export interface WeeklySummary {
    regular_hours: number;
    overtime_hours: number;
    total_hours: number;
    break_time: number;
  }

  export interface WeeklyReport {
    id?: string;
    user_id: string;
    week_start_date: string;
    week_end_date: string;
    regular_hours: number;
    overtime_hours: number;
    total_hours: number;
    break_time: number;
    is_approved: boolean;
    approved_by?: string | null;
    approval_date?: string | null;
    created_at?: string;
  }
  