
export interface Project {
    id: string;
    name: string;
    description?: string;
    is_active: boolean;
  }
  
  export interface Job {
    id: string;
    code: string;
    title: string;
    project_id: string;
    is_active: boolean;
  }
  
  export interface TimeEntry {
    id: string;
    user_id: string;
    project_id: string;
    job_id: string;
    clock_in: string;
    clock_out?: string;
    is_complete: boolean;
    notes?: string;
  }
  