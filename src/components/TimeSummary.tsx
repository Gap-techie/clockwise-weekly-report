import { Clock, Calendar } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import { startOfWeek, endOfWeek, startOfToday, endOfToday } from 'date-fns';
import { useQuery } from '@tanstack/react-query';

interface Summary {
  regularHours: number;
  overtimeHours: number;
  totalHours: number;
}

interface TimeEntry {
  id: string;
  clock_in: string;
  clock_out: string | null;
  is_complete: boolean;
  breaks: {
    start_time: string;
    end_time: string | null;
    is_complete: boolean;
  }[];
}

const TimeSummary = () => {
  const { user } = useAuth();

  // Fetch today's entries
  const { data: todayHours = 0 } = useQuery({
    queryKey: ['todayHours', user?.id],
    queryFn: async () => {
      if (!user) return 0;

      const today = startOfToday();
      const todayEnd = endOfToday();

      const { data: entries, error } = await supabase
        .from('time_entries')
        .select(`
          id,
          clock_in,
          clock_out,
          is_complete,
          breaks (
            start_time,
            end_time,
            is_complete
          )
        `)
        .eq('user_id', user.id)
        .gte('clock_in', today.toISOString())
        .lte('clock_in', todayEnd.toISOString());

      if (error) throw error;
      return calculateTotalHours(entries || []);
    },
    refetchInterval: 60000, // Refetch every minute
  });

  // Fetch weekly summary
  const { data: weeklySummary = { regularHours: 0, overtimeHours: 0, totalHours: 0 } } = useQuery({
    queryKey: ['weeklySummary', user?.id],
    queryFn: async () => {
      if (!user) return { regularHours: 0, overtimeHours: 0, totalHours: 0 };

      const weekStart = startOfWeek(new Date(), { weekStartsOn: 0 });
      const weekEnd = endOfWeek(new Date(), { weekStartsOn: 0 });

      const { data: entries, error } = await supabase
        .from('time_entries')
        .select(`
          id,
          clock_in,
          clock_out,
          is_complete,
          breaks (
            start_time,
            end_time,
            is_complete
          )
        `)
        .eq('user_id', user.id)
        .gte('clock_in', weekStart.toISOString())
        .lte('clock_in', weekEnd.toISOString());

      if (error) throw error;
      return calculateWeeklySummary(entries || []);
    },
    refetchInterval: 60000, // Refetch every minute
  });

  const calculateTotalHours = (entries: TimeEntry[]): number => {
    return entries.reduce((total, entry) => {
      const start = new Date(entry.clock_in);
      const end = entry.clock_out ? new Date(entry.clock_out) : new Date();
      
      // Calculate break duration
      const breakDuration = (entry.breaks || []).reduce((breakTotal, breakEntry) => {
        if (!breakEntry.end_time) return breakTotal;
        const breakStart = new Date(breakEntry.start_time);
        const breakEnd = new Date(breakEntry.end_time);
        return breakTotal + (breakEnd.getTime() - breakStart.getTime()) / (1000 * 60 * 60);
      }, 0);

      // Subtract breaks from total duration
      const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      return total + Math.max(0, duration - breakDuration);
    }, 0);
  };

  const calculateWeeklySummary = (entries: TimeEntry[]): Summary => {
    const totalHours = calculateTotalHours(entries);
    const regularHours = Math.min(totalHours, 40); // 40 hours per week standard
    const overtimeHours = Math.max(0, totalHours - 40);

    return {
      regularHours,
      overtimeHours,
      totalHours
    };
  };

  const formatHours = (hours: number) => {
    return `${hours.toFixed(1)} hrs`;
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
          <span className="font-medium">{formatHours(todayHours)}</span>
        </div>
        
        <div className="flex justify-between items-center py-2">
          <div className="flex items-center">
            <Calendar className="h-5 w-5 text-blue-500 mr-2" />
            <span>This Week</span>
          </div>
          <span className="font-medium">{formatHours(weeklySummary.totalHours)}</span>
        </div>
        
        <div className="pt-2 border-t border-gray-200">
          <h3 className="font-medium mb-2">Hours Breakdown</h3>
          
          <div className="flex justify-between py-1">
            <span className="text-gray-600">Regular Hours</span>
            <span>{formatHours(weeklySummary.regularHours)}</span>
          </div>
          
          <div className="flex justify-between py-1">
            <span className="text-gray-600">Overtime</span>
            <span>{formatHours(weeklySummary.overtimeHours)}</span>
          </div>
          
          <div className="flex justify-between py-2 font-medium border-t border-gray-200 mt-2">
            <span>Total</span>
            <span>{formatHours(weeklySummary.totalHours)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeSummary;
