import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { startBreak, endBreak } from '@/lib/supabase/breaks';
import { Break } from '@/types/breaks';
import { formatDuration } from '@/lib/utils';

interface BreakTimerProps {
  timeEntryId: string;
  isTimeEntryActive: boolean;
  disabled?: boolean;
  userId: string;
  onBreakUpdate?: (breakMinutes: number) => void;
}

export default function BreakTimer({ timeEntryId, isTimeEntryActive, disabled, userId, onBreakUpdate }: BreakTimerProps) {
  const [activeBreak, setActiveBreak] = useState<Break | null>(null);
  const [elapsedTime, setElapsedTime] = useState<number>(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (activeBreak) {
      interval = setInterval(() => {
        const startTime = new Date(activeBreak.start_time).getTime();
        const currentTime = new Date().getTime();
        const elapsed = Math.floor((currentTime - startTime) / 1000);
        setElapsedTime(elapsed);
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [activeBreak]);

  const handleStartBreak = async () => {
    if (!isTimeEntryActive) {
      toast({
        title: "Cannot start break",
        description: "No active time entry found.",
        variant: "destructive",
      });
      return;
    }

    try {
      const newBreak = await startBreak(timeEntryId);
      setActiveBreak(newBreak);
      toast({
        title: "Break started",
        description: "Your break has been started successfully.",
      });
    } catch (error) {
      toast({
        title: "Error starting break",
        description: "Failed to start break. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEndBreak = async () => {
    if (!activeBreak) return;

    try {
      await endBreak(activeBreak.id);
      setActiveBreak(null);
      setElapsedTime(0);
      toast({
        title: "Break ended",
        description: "Your break has been ended successfully.",
      });
    } catch (error) {
      toast({
        title: "Error ending break",
        description: "Failed to end break. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4 border rounded-lg">
      <h3 className="text-lg font-semibold">Break Timer</h3>
      {activeBreak ? (
        <>
          <div className="text-2xl font-mono">{formatDuration(elapsedTime)}</div>
          <Button 
            variant="destructive"
            onClick={handleEndBreak}
          >
            End Break
          </Button>
        </>
      ) : (
        <Button 
          variant="secondary"
          onClick={handleStartBreak}
          disabled={!isTimeEntryActive}
        >
          Start Break
        </Button>
      )}
    </div>
  );
}
