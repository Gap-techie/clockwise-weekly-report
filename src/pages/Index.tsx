
import { useState } from 'react';
import Header from '@/components/Header';
import TimeTracker from '@/components/TimeTracker';
import TimeSummary from '@/components/TimeSummary';
import WeeklyActivity from '@/components/WeeklyActivity';
import ActivityLog from '@/components/ActivityLog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { setupWeeklyReportScheduler } from '@/components/EmailService';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/lib/AuthContext';

const Index = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [emailSetup, setEmailSetup] = useState(false);
  
  const handleSetupEmailReports = () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to set up email reports",
        variant: "destructive"
      });
      return;
    }
    
    // This would normally prompt for an email address
    // We're mocking this functionality
    const email = user.email || "user@example.com";
    
    // Set up weekly email reports
    const scheduler = setupWeeklyReportScheduler(email);
    scheduler.start();
    
    setEmailSetup(true);
    
    toast({
      title: "Weekly Email Reports Activated",
      description: "You will receive weekly time tracking summaries every Friday.",
    });
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TimeTracker />
          <TimeSummary />
        </div>
        
        <div className="mt-6">
          <Tabs defaultValue="activity">
            <div className="flex justify-between items-center">
              <TabsList>
                <TabsTrigger value="activity">Recent Activity</TabsTrigger>
                <TabsTrigger value="weekly">Weekly Activity</TabsTrigger>
              </TabsList>
              
              {!emailSetup && (
                <button 
                  onClick={handleSetupEmailReports}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Enable Weekly Email Reports
                </button>
              )}
            </div>
            
            <TabsContent value="activity">
              <ActivityLog />
            </TabsContent>
            
            <TabsContent value="weekly">
              <WeeklyActivity />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Index;
