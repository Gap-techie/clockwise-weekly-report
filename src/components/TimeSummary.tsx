import { Clock, Calendar } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import { startOfWeek, endOfWeek, startOfToday, format, startOfDay, endOfDay } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { TimeEntry, DailySummary, WeeklyReport, WeeklySummary } from '@/types/timeTracker';

// Simplified database types to avoid deep instantiation
type DbBreak = {
  id: string;
  time_entry_id: string;
  start_time: string;
  end_time: string | null;
  is_complete: boolean;
  created_at: string;
};

type DbTimeEntry = {
  id: string;
  user_id: string;
  project_id: string;
  job_id: string;
  clock_in: string;
  clock_out: string | null;
  is_complete: boolean;
  created_at: string;
  notes?: string;
  breaks: DbBreak[];
};

const TimeSummary = () => {
  const { user } = useAuth();
  const today = startOfToday();
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 0 });
  const weekEnd = endOfWeek(new Date(), { weekStartsOn: 0 });

  // Fetch today's summary
  const { data: todaySummary } = useQuery<DailySummary | null>({
    queryKey: ['dailySummary', user?.id, format(today, 'yyyy-MM-dd')],
    queryFn: async () => {
      if (!user) return null;

      const { data: existingSummary } = await supabase
        .from('daily_summaries')
        .select()
        .eq('user_id', user.id)
        .eq('date', format(today, 'yyyy-MM-dd'))
        .single();

      if (existingSummary) {
        console.log('Found existing summary:', existingSummary);
        return existingSummary as DailySummary;
      }

      // If no summary exists yet, calculate it from time entries
      const todayStart = startOfDay(new Date()).toISOString();
      const todayEnd = endOfDay(new Date()).toISOString();

      const { data: entries, error: entriesError } = await supabase
        .from('time_entries')
        .select('id, user_id, project_id, job_id, clock_in, clock_out, is_complete, created_at, notes, breaks:breaks(id, time_entry_id, start_time, end_time, is_complete, created_at)')
        .eq('user_id', user.id)
        .gte('clock_in', todayStart)
        .lte('clock_in', todayEnd);

      if (entriesError) {
        console.error('Error fetching time entries:', entriesError);
        return null;
      }

      console.log('Found time entries:', entries);

      if (!entries?.length) {
        console.log('No time entries found for today');
        return null;
      }

      const typedEntries = entries as unknown as DbTimeEntry[];
      const totalHours = calculateTotalHours(typedEntries);
      const breakTime = calculateTotalBreakTime(typedEntries);
      const regularHours = Math.min(totalHours, 8); // 8 hours per day standard
      const overtimeHours = Math.max(0, totalHours - 8);

      console.log('Calculated hours:', {
        totalHours,
        breakTime,
        regularHours,
        overtimeHours
      });

      // Insert new daily summary
      const { data: newSummary, error: insertError } = await supabase
        .from('daily_summaries')
        .insert({
          user_id: user.id,
          date: format(today, 'yyyy-MM-dd'),
          day_of_week: today.getDay(),
          regular_hours: regularHours,
          overtime_hours: overtimeHours,
          total_hours: totalHours,
          break_time: breakTime
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error inserting daily summary:', insertError);
        throw insertError;
      }

      console.log('Created new summary:', newSummary);
      return newSummary as DailySummary;
    },
    refetchInterval: 60000, // Refetch every minute for active day
  });

  // Fetch weekly report
  const { data: weeklyReport } = useQuery<WeeklyReport | null>({
    queryKey: ['weeklyReport', user?.id, format(weekStart, 'yyyy-MM-dd')],
    queryFn: async () => {
      if (!user) return null;

      const { data: existingReport } = await supabase
        .from('weekly_reports')
        .select()
        .eq('user_id', user.id)
        .eq('week_start_date', format(weekStart, 'yyyy-MM-dd'))
        .single();

      if (existingReport) {
        console.log('Found existing weekly report:', existingReport);
        return existingReport as WeeklyReport;
      }

      // Calculate weekly totals from daily summaries
      const { data: summaries, error: summariesError } = await supabase
        .from('daily_summaries')
        .select('regular_hours, overtime_hours, total_hours, break_time')
        .eq('user_id', user.id)
        .gte('date', format(weekStart, 'yyyy-MM-dd'))
        .lte('date', format(weekEnd, 'yyyy-MM-dd'));

      if (summariesError) {
        console.error('Error fetching daily summaries:', summariesError);
        throw summariesError;
      }

      console.log('Found daily summaries for week:', summaries);

      const totals = (summaries || []).reduce<WeeklySummary>(
        (acc, summary) => ({
          regular_hours: acc.regular_hours + (summary.regular_hours || 0),
          overtime_hours: acc.overtime_hours + (summary.overtime_hours || 0),
          total_hours: acc.total_hours + (summary.total_hours || 0),
          break_time: acc.break_time + (summary.break_time || 0),
        }),
        { regular_hours: 0, overtime_hours: 0, total_hours: 0, break_time: 0 }
      );

      console.log('Calculated weekly totals:', totals);

      // Insert new weekly report
      const { data: newReport, error: insertError } = await supabase
        .from('weekly_reports')
        .insert({
          user_id: user.id,
          week_start_date: format(weekStart, 'yyyy-MM-dd'),
          week_end_date: format(weekEnd, 'yyyy-MM-dd'),
          regular_hours: totals.regular_hours,
          overtime_hours: totals.overtime_hours,
          total_hours: totals.total_hours,
          break_time: totals.break_time,
          is_approved: false,
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error inserting weekly report:', insertError);
        throw insertError;
      }

      console.log('Created new weekly report:', newReport);
      return newReport as WeeklyReport;
    },
    refetchInterval: 60000, // Refetch every minute for active week
  });

  const formatHours = (hours: number | null = 0) => {
    return `${(hours || 0).toFixed(1)} hrs`;
  };

  return (
    <div className="bg-white p-5 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Time Summary</h2>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center py-2">
          <div className="flex items-center">
            <Clock className="h-5 w-5 text-blue-500 mr-2" />
            <span>Today's Hours</span>
          </div>
          <span className="font-medium">{formatHours(todaySummary?.total_hours)}</span>
        </div>
        
        <div className="flex justify-between items-center py-2">
          <div className="flex items-center">
            <Calendar className="h-5 w-5 text-blue-500 mr-2" />
            <span>This Week</span>
          </div>
          <span className="font-medium">{formatHours(weeklyReport?.total_hours)}</span>
        </div>
        
        <div className="pt-2 border-t border-gray-200">
          <h3 className="font-medium mb-2">Hours Breakdown</h3>
          
          <div className="flex justify-between py-1">
            <span className="text-gray-600">Regular Hours</span>
            <span>{formatHours(weeklyReport?.regular_hours)}</span>
          </div>
          
          <div className="flex justify-between py-1">
            <span className="text-gray-600">Overtime</span>
            <span>{formatHours(weeklyReport?.overtime_hours)}</span>
          </div>
          
          <div className="flex justify-between py-1">
            <span className="text-gray-600">Break Time</span>
            <span>{formatHours(weeklyReport?.break_time)}</span>
          </div>
          
          <div className="flex justify-between py-2 font-medium border-t border-gray-200 mt-2">
            <span>Total</span>
            <span>{formatHours(weeklyReport?.total_hours)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeSummary;

// Helper function to calculate total break time
const calculateTotalBreakTime = (entries: DbTimeEntry[]): number => {
  return entries.reduce((total, entry) => {
    const breakTime = entry.breaks?.reduce((breakTotal, breakEntry) => {
      if (!breakEntry.end_time) return breakTotal;
      const breakStart = new Date(breakEntry.start_time);
      const breakEnd = new Date(breakEntry.end_time);
      return breakTotal + (breakEnd.getTime() - breakStart.getTime()) / (1000 * 60 * 60);
    }, 0) || 0;
    return total + breakTime;
  }, 0);
};

// Helper function to calculate hours from time entries
const calculateTotalHours = (entries: DbTimeEntry[]): number => {
  return entries.reduce((total, entry) => {
    const start = new Date(entry.clock_in);
    const end = entry.clock_out ? new Date(entry.clock_out) : new Date();
    
    // Calculate break duration
    const breakDuration = calculateTotalBreakTime([entry]);

    // Subtract breaks from total duration
    const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    return total + Math.max(0, duration - breakDuration);
  }, 0);
};
