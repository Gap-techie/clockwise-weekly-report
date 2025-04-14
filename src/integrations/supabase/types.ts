export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      breaks: {
        Row: {
          created_at: string | null
          end_time: string | null
          id: string
          is_complete: boolean | null
          start_time: string
          time_entry_id: string | null
        }
        Insert: {
          created_at?: string | null
          end_time?: string | null
          id?: string
          is_complete?: boolean | null
          start_time: string
          time_entry_id?: string | null
        }
        Update: {
          created_at?: string | null
          end_time?: string | null
          id?: string
          is_complete?: boolean | null
          start_time?: string
          time_entry_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "breaks_time_entry_id_fkey"
            columns: ["time_entry_id"]
            isOneToOne: false
            referencedRelation: "active_time_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "breaks_time_entry_id_fkey"
            columns: ["time_entry_id"]
            isOneToOne: false
            referencedRelation: "recent_activity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "breaks_time_entry_id_fkey"
            columns: ["time_entry_id"]
            isOneToOne: false
            referencedRelation: "time_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_summaries: {
        Row: {
          break_time: number | null
          created_at: string | null
          date: string
          day_of_week: number
          id: string
          job_id: string | null
          overtime_hours: number | null
          project_id: string | null
          regular_hours: number | null
          total_hours: number | null
          user_id: string | null
        }
        Insert: {
          break_time?: number | null
          created_at?: string | null
          date: string
          day_of_week: number
          id?: string
          job_id?: string | null
          overtime_hours?: number | null
          project_id?: string | null
          regular_hours?: number | null
          total_hours?: number | null
          user_id?: string | null
        }
        Update: {
          break_time?: number | null
          created_at?: string | null
          date?: string
          day_of_week?: number
          id?: string
          job_id?: string | null
          overtime_hours?: number | null
          project_id?: string | null
          regular_hours?: number | null
          total_hours?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "daily_summaries_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_summaries_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_summaries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      email_report_settings: {
        Row: {
          created_at: string | null
          email_report_day: number | null
          id: string
          user_id: string | null
          weekly_report_enabled: boolean | null
        }
        Insert: {
          created_at?: string | null
          email_report_day?: number | null
          id?: string
          user_id?: string | null
          weekly_report_enabled?: boolean | null
        }
        Update: {
          created_at?: string | null
          email_report_day?: number | null
          id?: string
          user_id?: string | null
          weekly_report_enabled?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "email_report_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          code: string
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          project_id: string | null
          title: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          project_id?: string | null
          title?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          project_id?: string | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "jobs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
        }
        Relationships: []
      }
      time_entries: {
        Row: {
          clock_in: string
          clock_out: string | null
          created_at: string | null
          id: string
          is_complete: boolean | null
          job_id: string | null
          notes: string | null
          project_id: string | null
          user_id: string | null
        }
        Insert: {
          clock_in: string
          clock_out?: string | null
          created_at?: string | null
          id?: string
          is_complete?: boolean | null
          job_id?: string | null
          notes?: string | null
          project_id?: string | null
          user_id?: string | null
        }
        Update: {
          clock_in?: string
          clock_out?: string | null
          created_at?: string | null
          id?: string
          is_complete?: boolean | null
          job_id?: string | null
          notes?: string | null
          project_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "time_entries_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          auth_id: string | null
          created_at: string | null
          email: string
          full_name: string
          hourly_rate: number | null
          id: string
          last_login: string | null
          regular_hours_limit: number | null
          role: string
        }
        Insert: {
          auth_id?: string | null
          created_at?: string | null
          email: string
          full_name: string
          hourly_rate?: number | null
          id?: string
          last_login?: string | null
          regular_hours_limit?: number | null
          role: string
        }
        Update: {
          auth_id?: string | null
          created_at?: string | null
          email?: string
          full_name?: string
          hourly_rate?: number | null
          id?: string
          last_login?: string | null
          regular_hours_limit?: number | null
          role?: string
        }
        Relationships: []
      }
      weekly_reports: {
        Row: {
          approval_date: string | null
          approved_by: string | null
          created_at: string | null
          id: string
          is_approved: boolean | null
          overtime_hours: number | null
          regular_hours: number | null
          total_hours: number | null
          user_id: string | null
          week_end_date: string
          week_start_date: string
        }
        Insert: {
          approval_date?: string | null
          approved_by?: string | null
          created_at?: string | null
          id?: string
          is_approved?: boolean | null
          overtime_hours?: number | null
          regular_hours?: number | null
          total_hours?: number | null
          user_id?: string | null
          week_end_date: string
          week_start_date: string
        }
        Update: {
          approval_date?: string | null
          approved_by?: string | null
          created_at?: string | null
          id?: string
          is_approved?: boolean | null
          overtime_hours?: number | null
          regular_hours?: number | null
          total_hours?: number | null
          user_id?: string | null
          week_end_date?: string
          week_start_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "weekly_reports_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "weekly_reports_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      active_time_entries: {
        Row: {
          active_breaks: number | null
          clock_in: string | null
          current_time: string | null
          elapsed_hours: number | null
          full_name: string | null
          id: string | null
          job_code: string | null
          job_id: string | null
          project_id: string | null
          project_name: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "time_entries_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      recent_activity: {
        Row: {
          clock_in: string | null
          clock_out: string | null
          full_name: string | null
          id: string | null
          job_code: string | null
          job_id: string | null
          notes: string | null
          project_id: string | null
          project_name: string | null
          total_hours: number | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "time_entries_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      calculate_daily_hours: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      calculate_hours_worked: {
        Args: { entry_id: string }
        Returns: number
      }
      generate_weekly_report: {
        Args: { p_user_id: string; p_week_start: string }
        Returns: undefined
      }
      generate_weekly_reports: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
