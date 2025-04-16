import React, { useMemo } from 'react';
import { useTimeStore } from '@/lib/timeStore';
import { useProjectsForRecentActivity } from '@/hooks/queries/useProjects'; // 👈 import custom hook
import { formatDateDisplay, formatTimeForDisplay } from '@/lib/timeUtils';

const RecentActivity = () => {
  const { timeEntries } = useTimeStore();

  const {
    data: projects = {},
    isLoading,
    isError,
    error,
  } = useProjectsForRecentActivity(); // 👈 use the modularized query

  const sortedEntries = useMemo(() => {
    if (!projects || timeEntries.length === 0) return [];

    return timeEntries
      .filter(entry => entry.clockOutTime)
      .map(entry => {
        const clockInTime = new Date(entry.clockInTime);
        const clockOutTime = new Date(entry.clockOutTime);
        const durationMs = clockOutTime.getTime() - clockInTime.getTime();
        const hours = (durationMs / (1000 * 60 * 60)).toFixed(1);

        return {
          ...entry,
          clockInTime,
          clockOutTime,
          projectName: projects[entry.projectId] || 'Project Not Found',
          hours,
        };
      })
      .sort((a, b) => b.clockInTime.getTime() - a.clockInTime.getTime());
  }, [timeEntries, projects]);

  if (isLoading) return <div>Loading recent activity...</div>;
  if (isError) return <div>Error loading projects: {(error as Error).message}</div>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[700px] border-collapse">
        <thead>
          <tr className="text-left border-b border-gray-200">
            <th className="py-2 font-medium">Date</th>
            <th className="py-2 font-medium">Project</th>
            <th className="py-2 font-medium">Job Code</th>
            <th className="py-2 font-medium">Clock In</th>
            <th className="py-2 font-medium">Clock Out</th>
            <th className="py-2 font-medium text-right">Total Hours</th>
          </tr>
        </thead>
        <tbody>
          {sortedEntries.length > 0 ? (
            sortedEntries.map((entry) => (
              <tr key={entry.id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="py-3 text-sm">{formatDateDisplay(entry.clockInTime)}</td>
                <td className="py-3 text-sm">{entry.projectName}</td>
                <td className="py-3 text-sm">{entry.jobCode}</td>
                <td className="py-3 text-sm">{formatTimeForDisplay(entry.clockInTime)}</td>
                <td className="py-3 text-sm">{formatTimeForDisplay(entry.clockOutTime)}</td>
                <td className="py-3 text-right font-medium">{entry.hours}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} className="py-6 text-center text-gray-500">
                No time entries found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default RecentActivity;
