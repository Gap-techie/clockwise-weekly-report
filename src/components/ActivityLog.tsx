
import React, { useState, useEffect } from 'react';
import { useTimeStore } from '@/lib/timeStore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatDateDisplay, formatTimeForDisplay } from '@/lib/timeUtils';

const RecentActivity = () => {
  const { timeEntries, projects } = useTimeStore();
  const [sortedEntries, setSortedEntries] = useState<any[]>([]);
  
  useEffect(() => {
    // Process and sort entries
    const processedEntries = timeEntries
      .filter(entry => entry.clockOutTime) // Only show completed entries
      .map(entry => {
        const project = projects.find(p => p.id === entry.projectId);
        const durationMs = entry.clockOutTime!.getTime() - entry.clockInTime.getTime();
        const hours = (durationMs / (1000 * 60 * 60)).toFixed(1);
        
        return {
          ...entry,
          projectName: project?.name || 'Unknown Project',
          hours
        };
      })
      .sort((a, b) => b.clockInTime.getTime() - a.clockInTime.getTime()); // Most recent first
    
    setSortedEntries(processedEntries);
  }, [timeEntries, projects]);
  
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
              <tr 
                key={entry.id}
                className="border-b border-gray-200 hover:bg-gray-50"
              >
                <td className="py-3 text-sm">{formatDateDisplay(entry.clockInTime)}</td>
                <td className="py-3 text-sm">{entry.projectName}</td>
                <td className="py-3 text-sm">{entry.jobCode}</td>
                <td className="py-3 text-sm">{formatTimeForDisplay(entry.clockInTime)}</td>
                <td className="py-3 text-sm">{formatTimeForDisplay(entry.clockOutTime!)}</td>
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

const ActivityLog = () => {
  return (
    <div className="bg-white p-5 rounded-lg shadow mt-6">
      <Tabs defaultValue="recent">
        <TabsList className="mb-4">
          <TabsTrigger value="recent">Recent Activity</TabsTrigger>
          <TabsTrigger value="weekly">Weekly Activity</TabsTrigger>
        </TabsList>
        
        <TabsContent value="recent">
          <RecentActivity />
        </TabsContent>
        
        <TabsContent value="weekly">
          <div className="p-6 text-center text-gray-500">
            Weekly activity view is available in the dashboard
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ActivityLog;
