import { useState, useEffect } from 'react';
import { useTimeStore } from '@/lib/timeStore';
import { format, addWeeks, subWeeks } from 'date-fns';
import { getWeekRangeString, getDatesForWeek, formatDate } from '@/lib/timeUtils';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const WeeklyActivity = () => {
  const { 
    projects,
    timeEntries, 
    currentWeekDate,
    setCurrentWeekDate,
    getWeeklySummary 
  } = useTimeStore();
  
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  
  // Process time entries for the current week
  useEffect(() => {
    const summary = getWeeklySummary();
    const weekDays = getDatesForWeek(currentWeekDate);
    
    // Get unique project-job combinations from the week's entries
    const projectJobMap = new Map();
    
    timeEntries.forEach(entry => {
      if (!entry.clockOutTime) return;
      
      // Ensure clockInTime is a Date object
      const clockInTime = entry.clockInTime instanceof Date 
        ? entry.clockInTime 
        : new Date(entry.clockInTime);
      
      const entryDate = formatDate(clockInTime);
      const isInWeek = Object.keys(summary.days).includes(entryDate);
      
      if (isInWeek) {
        const key = `${entry.projectId}-${entry.jobCode}`;
        projectJobMap.set(key, {
          projectId: entry.projectId,
          jobCode: entry.jobCode
        });
      }
    });
    
    // Create table rows
    const rows = Array.from(projectJobMap.values()).map(({ projectId, jobCode }) => {
      const projectName = projects.find(p => p.id === projectId)?.name || 'Unknown Project';
      
      // Get hours for each day
      const days = weekDays.map(day => {
        const dateStr = formatDate(day);
        let hours = 0;
        
        timeEntries.forEach(entry => {
          if (!entry.clockOutTime) return;
          
          // Ensure clockInTime and clockOutTime are Date objects
          const clockInTime = entry.clockInTime instanceof Date 
            ? entry.clockInTime 
            : new Date(entry.clockInTime);
          
          const clockOutTime = entry.clockOutTime instanceof Date 
            ? entry.clockOutTime 
            : new Date(entry.clockOutTime as string);
          
          const entryDateStr = formatDate(clockInTime);
          if (entryDateStr === dateStr && 
              entry.projectId === projectId && 
              entry.jobCode === jobCode) {
            const durationMs = clockOutTime.getTime() - clockInTime.getTime();
            hours += durationMs / (1000 * 60 * 60);
          }
        });
        
        return hours.toFixed(1);
      });
      
      // Calculate total
      const total = days.reduce((sum, hours) => sum + parseFloat(hours), 0).toFixed(1);
      
      return {
        projectId,
        projectName,
        jobCode,
        days,
        total
      };
    });
    
    setWeeklyData(rows);
  }, [timeEntries, currentWeekDate, projects, getWeeklySummary]);
  
  const handlePreviousWeek = () => {
    setCurrentWeekDate(subWeeks(currentWeekDate, 1));
  };
  
  const handleNextWeek = () => {
    setCurrentWeekDate(addWeeks(currentWeekDate, 1));
  };
  
  const weekDays = getDatesForWeek(currentWeekDate);
  
  return (
    <div className="bg-white p-5 rounded-lg shadow mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Weekly Activity</h2>
        
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="icon"
            onClick={handlePreviousWeek}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <span className="text-sm font-medium">
            {getWeekRangeString(currentWeekDate)}
          </span>
          
          <Button 
            variant="outline" 
            size="icon"
            onClick={handleNextWeek}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px] border-collapse">
          <thead>
            <tr className="text-left border-b border-gray-200">
              <th className="py-2 font-medium">Project</th>
              <th className="py-2 font-medium">Job Code</th>
              {weekDays.map((day, index) => (
                <th key={index} className="py-2 font-medium text-center">
                  {format(day, 'EEE')}
                </th>
              ))}
              <th className="py-2 font-medium text-right">Total</th>
            </tr>
          </thead>
          
          <tbody>
            {weeklyData.length > 0 ? (
              weeklyData.map((row, index) => (
                <tr 
                  key={`${row.projectId}-${row.jobCode}-${index}`}
                  className="border-b border-gray-200 hover:bg-gray-50"
                >
                  <td className="py-3 text-sm">{row.projectName}</td>
                  <td className="py-3 text-sm">{row.jobCode}</td>
                  
                  {row.days.map((hours: string, dayIndex: number) => (
                    <td key={dayIndex} className="py-3 text-center text-sm">
                      {parseFloat(hours) > 0 ? hours : ''}
                    </td>
                  ))}
                  
                  <td className="py-3 text-right font-medium">{row.total}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} className="py-6 text-center text-gray-500">
                  No time entries for this week
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WeeklyActivity;
