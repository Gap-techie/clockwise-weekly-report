export interface Break {
  id: string;
  time_entry_id: string;
  start_time: string;
  end_time: string | null;
  is_complete: boolean;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface BreakSummary {
  totalBreakDuration: number;  // in minutes
  compensatedDuration: number; // in minutes (30 minutes per day)
  deductedDuration: number;    // in minutes (total - compensated)
} 