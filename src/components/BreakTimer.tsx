
import { useState, useEffect } from 'react';
import { Coffee, Play, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatTimeDisplay } from '@/lib/timeUtils';
import { useToast } from '@/components/ui/use-toast';

interface BreakTimerProps {
  timeEntryId: string | null;
  disabled: boolean;
}

const BreakTimer = ({ timeEntryId, disabled }: BreakTimerProps) => {
  const { toast } = useToast();
  const [breakActive, setBreakActive] = useState(false);
  const [breakStartTime, setBreakStartTime] = useState<Date | null>(null);
  const [breakTimer, setBreakTimer] = useState(0);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    let interval: number | null = null;
    
    if (breakActive && breakStartTime) {
      interval = window.setInterval(() => {
        const now = new Date();
        const elapsedSeconds = Math.floor((now.getTime() - breakStartTime.getTime()) / 1000);
        setBreakTimer(elapsedSeconds);
      }, 1000);
    } else {
      setBreakTimer(0);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [breakActive, breakStartTime]);
  
  const startBreak = async () => {
    if (!timeEntryId || disabled) return;
    
    setLoading(true);
    try {
      // In a real implementation, you would call your API to record break start
      // For now, we'll just update the local state
      setBreakStartTime(new Date());
      setBreakActive(true);
      
      toast({
        title: "Break Started",
        description: "Your break time is now being tracked"
      });
    } catch (error) {
      console.error('Error starting break:', error);
      toast({
        title: "Error",
        description: "Could not start break. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const endBreak = async () => {
    if (!timeEntryId || !breakActive) return;
    
    setLoading(true);
    try {
      // In a real implementation, you would call your API to record break end
      // For now, we'll just update the local state
      setBreakActive(false);
      setBreakStartTime(null);
      
      toast({
        title: "Break Ended",
        description: "You are now back on the clock"
      });
    } catch (error) {
      console.error('Error ending break:', error);
      toast({
        title: "Error",
        description: "Could not end break. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  if (!timeEntryId) {
    return null;
  }
  
  return (
    <div className="mt-4 border-t pt-4">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center">
          <Coffee className="h-5 w-5 mr-2 text-gray-600" />
          <span className="text-sm font-medium">Break Timer</span>
        </div>
        <div className="text-lg font-mono">{formatTimeDisplay(breakTimer)}</div>
      </div>
      
      <Button
        className="w-full"
        variant={breakActive ? "destructive" : "outline"}
        onClick={breakActive ? endBreak : startBreak}
        disabled={disabled || loading}
      >
        {breakActive ? (
          <>
            <Square className="h-4 w-4 mr-2" />
            End Break
          </>
        ) : (
          <>
            <Play className="h-4 w-4 mr-2" />
            Start Break
          </>
        )}
      </Button>
    </div>
  );
};

export default BreakTimer;
