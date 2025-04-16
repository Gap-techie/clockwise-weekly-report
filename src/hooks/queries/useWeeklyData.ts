import { useQuery } from '@tanstack/react-query';
import { startOfWeek, endOfWeek, eachDayOfInterval, format } from 'date-fns';
import { supabase } from '@/lib/supabaseClient';

const fetchWeeklyData = async (userId: string, week: Date) => {
    const start = startOfWeek(week, { weekStartsOn: 0 });
    const end = endOfWeek(week, { weekStartsOn: 0 });

    const { data: timeEntries, error } = await supabase
        .from('time_entries')
        .select(`
      id,
      clock_in,
      clock_out,
      project_id,
      projects (
        name
      ),
      jobs (
        code
      )
    `)
        .eq('user_id', userId)
        .gte('clock_in', start.toISOString())
        .lte('clock_in', end.toISOString())
        .order('clock_in', { ascending: true });

    if (error) throw new Error(error.message);

    const weekDays = eachDayOfInterval({ start, end });

    return weekDays.map(day => {
        const dayEntries = timeEntries?.filter(entry => {
            const entryDate = new Date(entry.clock_in);
            return format(entryDate, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd');
        }) || [];

        const totalHours = dayEntries.reduce((total, entry) => {
            if (!entry.clock_out) return total;
            const start = new Date(entry.clock_in);
            const end = new Date(entry.clock_out);
            const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
            return total + hours;
        }, 0);

        return {
            date: day,
            dayName: format(day, 'EEEE'),
            shortDate: format(day, 'MMM d'),
            hours: totalHours.toFixed(2),
            entries: dayEntries,
        };
    });
};

export const useWeeklyData = (userId: string | undefined, week: Date) => {
    return useQuery({
        queryKey: ['weeklyData', userId, week],
        queryFn: () => {
            if (!userId) return Promise.resolve([]);
            return fetchWeeklyData(userId, week);
        },
        enabled: !!userId,
    });
};

export default useWeeklyData;
