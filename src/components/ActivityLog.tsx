import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import RecentActivity from '@/components/RecentActivity';
import WeeklyActivity from '@/components/WeeklyActivity';


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
          <WeeklyActivity />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ActivityLog;
