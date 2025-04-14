
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTimeStore } from '@/lib/timeStore';
import { formatDateDisplay } from '@/lib/timeUtils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Reports = () => {
  const { timeEntries, projects, getWeeklySummary } = useTimeStore();
  const weeklySummary = getWeeklySummary();
  
  // Prepare data for the chart
  const dailyHoursData = Object.entries(weeklySummary.days).map(([date, day]) => ({
    name: formatDateDisplay(new Date(date)),
    regular: parseFloat(day.regularHours.toFixed(1)),
    overtime: parseFloat(day.overtimeHours.toFixed(1)),
  }));
  
  // Calculate project distribution
  const projectHours: { [key: string]: number } = {};
  
  timeEntries.forEach(entry => {
    if (!entry.clockOutTime) return;
    
    const project = projects.find(p => p.id === entry.projectId);
    if (!project) return;
    
    const durationMs = entry.clockOutTime.getTime() - entry.clockInTime.getTime();
    const hours = durationMs / (1000 * 60 * 60);
    
    projectHours[project.name] = (projectHours[project.name] || 0) + hours;
  });
  
  const projectData = Object.entries(projectHours).map(([name, hours]) => ({
    name,
    hours: parseFloat(hours.toFixed(1)),
  }));
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container max-w-7xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Time Reports</h1>
        
        <Tabs defaultValue="weekly">
          <TabsList className="mb-4">
            <TabsTrigger value="weekly">Weekly Summary</TabsTrigger>
            <TabsTrigger value="projects">Project Distribution</TabsTrigger>
          </TabsList>
          
          <TabsContent value="weekly">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Regular Hours</CardTitle>
                  <CardDescription>Standard work hours</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {weeklySummary.regularHours.toFixed(1)} hrs
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Overtime Hours</CardTitle>
                  <CardDescription>Hours beyond standard</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {weeklySummary.overtimeHours.toFixed(1)} hrs
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Total Hours</CardTitle>
                  <CardDescription>All tracked time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {weeklySummary.totalHours.toFixed(1)} hrs
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Daily Hours Breakdown</CardTitle>
                <CardDescription>Regular vs. Overtime hours</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={dailyHoursData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="regular" name="Regular Hours" stackId="a" fill="#3B82F6" />
                      <Bar dataKey="overtime" name="Overtime Hours" stackId="a" fill="#EC4899" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline">Download Report</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="projects">
            <Card>
              <CardHeader>
                <CardTitle>Project Time Distribution</CardTitle>
                <CardDescription>Hours spent per project</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={projectData}
                      layout="vertical"
                      margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" />
                      <Tooltip />
                      <Bar dataKey="hours" name="Hours" fill="#3B82F6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline">Download Report</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Reports;
