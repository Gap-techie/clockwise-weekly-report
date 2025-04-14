
import { useEffect, useState } from 'react';
import { useTimeStore } from '@/lib/timeStore';
import { Clock, Calendar } from 'lucide-react';

const TimeSummary = () => {
  const { 
    getWeeklySummary,
    getTodayHours
  } = useTimeStore();
  
  const [todayHours, setTodayHours] = useState(0);
  const [weeklySummary, setWeeklySummary] = useState({
    regularHours: 0,
    overtimeHours: 0,
    totalHours: 0
  });
  
  // Update summary data
  useEffect(() => {
    const updateData = () => {
      setTodayHours(getTodayHours());
      const summary = getWeeklySummary();
      setWeeklySummary({
        regularHours: summary.regularHours,
        overtimeHours: summary.overtimeHours, 
        totalHours: summary.totalHours
      });
    };
    
    updateData();
    
    // Update regularly to capture ongoing time tracking
    const interval = setInterval(updateData, 60000);
    return () => clearInterval(interval);
  }, [getTodayHours, getWeeklySummary]);
  
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
