
import useWeeklyData from "@/hooks/queries/useWeeklyData";
import { useAuth } from "@/lib/AuthContext";
import { useState } from "react";
import { format } from "date-fns";


const WeeklyActivity = () => {
  const { user } = useAuth();
  const [currentWeek] = useState(new Date());

  const {
    data: weeklyData = [],
    isLoading,
    isError,
    error,
  } = useWeeklyData(user?.id, currentWeek);

  if (isLoading) return <div>Loading weekly data...</div>;
  if (isError) return <div>Error loading data: {(error as Error).message}</div>;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-7 gap-4">
        {weeklyData.map((day, index) => (
          <div key={index} className="p-4 border rounded-lg bg-white shadow-sm">
            <div className="text-sm font-medium text-gray-600">{day.dayName}</div>
            <div className="text-xs text-gray-500 mb-2">{day.shortDate}</div>
            <div className="text-lg font-semibold">
              {Number(day.hours) > 0 ? `${day.hours}h` : '-'}
            </div>
          </div>
        ))}
      </div>
      <div className="text-sm text-gray-500 text-center mt-4">
        Showing data for week of {format(weeklyData[0]?.date || new Date(), 'MMMM d, yyyy')}
      </div>
    </div>
  );
};
export default WeeklyActivity;
