
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Clock, Play, Pause, RotateCcw } from "lucide-react";

type PomodoroState = {
  working: boolean;
  timeLeft: number;
  sessionCount: number;
  workDuration: number;
  breakDuration: number;
};

export const PomodoroTimer = () => {
  const { toast } = useToast();
  const [pomodoro, setPomodoro] = useState<PomodoroState>({
    working: false,
    timeLeft: 25 * 60, // 25 minutes in seconds
    sessionCount: 0,
    workDuration: 25, // minutes
    breakDuration: 5, // minutes
  });
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [timer]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const playSound = (isWorkSession: boolean) => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      // Configure oscillator
      oscillator.type = "sine";
      oscillator.frequency.value = isWorkSession ? 800 : 600; // Different frequencies for work/break
      
      // Configure volume
      gainNode.gain.value = 0.5;
      
      // Connect nodes
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Play sound
      oscillator.start();
      
      // Stop after 0.5 seconds
      setTimeout(() => {
        oscillator.stop();
        audioContext.close();
      }, 500);
    } catch (error) {
      console.error("Failed to play notification sound:", error);
    }
  };

  const startPomodoroTimer = () => {
    if (timer) {
      clearInterval(timer);
    }
    
    const newTimer = setInterval(() => {
      setPomodoro((prev) => {
        if (prev.timeLeft <= 1) {
          // Time's up
          clearInterval(newTimer);
          const isWorkSession = prev.working;
          
          // Play a sound to notify the user
          playSound(isWorkSession);
          
          if (isWorkSession) {
            // Switch to break
            toast({
              title: "Work session complete!",
              description: "Take a break.",
            });
            return {
              ...prev,
              working: false,
              timeLeft: prev.breakDuration * 60,
              sessionCount: prev.sessionCount + 1,
            };
          } else {
            // Switch to work
            toast({
              title: "Break time over!",
              description: "Back to work!",
            });
            return {
              ...prev,
              working: true,
              timeLeft: prev.workDuration * 60,
            };
          }
        }
        return {
          ...prev,
          timeLeft: prev.timeLeft - 1,
        };
      });
    }, 1000);
    
    setTimer(newTimer);
    setPomodoro((prev) => ({ ...prev, working: true }));
  };

  const pausePomodoroTimer = () => {
    if (timer) {
      clearInterval(timer);
      setTimer(null);
      setPomodoro((prev) => ({ ...prev, working: false }));
    }
  };

  const resetPomodoroTimer = () => {
    if (timer) {
      clearInterval(timer);
      setTimer(null);
    }
    setPomodoro({
      working: false,
      timeLeft: pomodoro.workDuration * 60,
      sessionCount: 0,
      workDuration: pomodoro.workDuration,
      breakDuration: pomodoro.breakDuration,
    });
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Clock className="mr-2 h-5 w-5" />
          Pomodoro Timer
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center">
          <div className="text-4xl font-bold mb-4">
            {formatTime(pomodoro.timeLeft)}
          </div>
          <div className="mb-4 text-muted-foreground">
            {pomodoro.working ? "Working" : "Break"} - Session {pomodoro.sessionCount + 1}
          </div>
          <div className="flex space-x-4 mb-6">
            {timer ? (
              <Button onClick={pausePomodoroTimer}>
                <Pause className="mr-2 h-4 w-4" />
                Pause
              </Button>
            ) : (
              <Button onClick={startPomodoroTimer}>
                <Play className="mr-2 h-4 w-4" />
                Start
              </Button>
            )}
            <Button variant="outline" onClick={resetPomodoroTimer}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-8 w-full max-w-md">
            <div>
              <Label>Work Duration: {pomodoro.workDuration} min</Label>
              <Slider
                value={[pomodoro.workDuration]}
                min={5}
                max={60}
                step={5}
                onValueChange={(values) => 
                  setPomodoro((prev) => ({ 
                    ...prev, 
                    workDuration: values[0],
                    timeLeft: prev.working ? values[0] * 60 : prev.timeLeft
                  }))
                }
                className="mt-2"
                disabled={timer !== null}
              />
            </div>
            <div>
              <Label>Break Duration: {pomodoro.breakDuration} min</Label>
              <Slider
                value={[pomodoro.breakDuration]}
                min={1}
                max={30}
                step={1}
                onValueChange={(values) => 
                  setPomodoro((prev) => ({ 
                    ...prev, 
                    breakDuration: values[0],
                    timeLeft: !prev.working ? values[0] * 60 : prev.timeLeft
                  }))
                }
                className="mt-2"
                disabled={timer !== null}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
