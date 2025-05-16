import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Calendar as DatePicker } from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { useSubjects } from "@/lib/database";
import { Clock, Play, Pause, RotateCcw } from "lucide-react";

type PomodoroState = {
  working: boolean;
  timeLeft: number;
  sessionCount: number;
  workDuration: number;
  breakDuration: number;
};

const StudyPlanner = () => {
  const { subjects } = useSubjects();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [studyHours, setStudyHours] = useState<number>(1);
  const [studyMinutes, setStudyMinutes] = useState<number>(0);
  const [studySessions, setStudySessions] = useState<any[]>([]);
  const [notes, setNotes] = useState<string>("");
  
  // Pomodoro timer
  const [pomodoro, setPomodoro] = useState<PomodoroState>({
    working: false,
    timeLeft: 25 * 60, // 25 minutes in seconds
    sessionCount: 0,
    workDuration: 25, // minutes
    breakDuration: 5, // minutes
  });
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    // Load study sessions from local storage
    const savedSessions = localStorage.getItem("studySessions");
    if (savedSessions) {
      setStudySessions(JSON.parse(savedSessions));
    }
    
    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, []);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
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
          const audio = new Audio();
          try {
            // Simple beep sound based on session type
            const context = new (window.AudioContext || (window as any).webkitAudioContext)();
            const oscillator = context.createOscillator();
            oscillator.type = "sine";
            oscillator.frequency.value = isWorkSession ? 800 : 400; // Different tone for work vs break
            oscillator.connect(context.destination);
            oscillator.start();
            setTimeout(() => oscillator.stop(), 500);
          } catch (e) {
            console.error("Audio notification failed:", e);
          }
          
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

  const addStudySession = () => {
    if (!selectedSubjectId) {
      toast({
        title: "Error",
        description: "Please select a subject",
        variant: "destructive",
      });
      return;
    }
    
    const subject = subjects.find((s: any) => s.id.toString() === selectedSubjectId);
    
    if (!subject) {
      toast({
        title: "Error",
        description: "Invalid subject",
        variant: "destructive",
      });
      return;
    }
    
    const totalMinutes = studyHours * 60 + studyMinutes;
    
    if (totalMinutes <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid duration",
        variant: "destructive",
      });
      return;
    }
    
    const newSession = {
      id: Date.now(),
      subject: subject.name,
      subjectId: subject.id,
      date: selectedDate.toISOString(),
      duration: totalMinutes,
      notes: notes,
    };
    
    const updatedSessions = [...studySessions, newSession];
    setStudySessions(updatedSessions);
    localStorage.setItem("studySessions", JSON.stringify(updatedSessions));
    
    // Reset form
    setNotes("");
    
    toast({
      title: "Success",
      description: `Study session for ${subject.name} added successfully`,
    });
  };

  const removeStudySession = (id: number) => {
    const updatedSessions = studySessions.filter((session) => session.id !== id);
    setStudySessions(updatedSessions);
    localStorage.setItem("studySessions", JSON.stringify(updatedSessions));
    
    toast({
      title: "Success",
      description: "Study session removed successfully",
    });
  };

  const filteredSessions = studySessions.filter((session) => {
    const sessionDate = new Date(session.date);
    return (
      sessionDate.getDate() === selectedDate.getDate() &&
      sessionDate.getMonth() === selectedDate.getMonth() &&
      sessionDate.getFullYear() === selectedDate.getFullYear()
    );
  });

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="container mx-auto p-4 animate-fade-in">
      <h1 className="text-2xl font-bold mb-6">Study Planner</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1 md:col-span-2">
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

          <Card>
            <CardHeader>
              <CardTitle>Plan Your Study Session</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Select 
                    value={selectedSubjectId} 
                    onValueChange={setSelectedSubjectId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((subject: any) => (
                        <SelectItem key={subject.id} value={subject.id.toString()}>
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex space-x-4">
                  <div className="w-1/2">
                    <Label htmlFor="hours">Hours</Label>
                    <Input
                      id="hours"
                      type="number"
                      min="0"
                      max="24"
                      value={studyHours}
                      onChange={(e) => setStudyHours(parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div className="w-1/2">
                    <Label htmlFor="minutes">Minutes</Label>
                    <Input
                      id="minutes"
                      type="number"
                      min="0"
                      max="59"
                      value={studyMinutes}
                      onChange={(e) => setStudyMinutes(parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="notes">Notes (optional)</Label>
                  <Input
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="What will you study?"
                  />
                </div>
                <Button onClick={addStudySession}>Add Study Session</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="custom-calendar">
                <DatePicker
                  onChange={setSelectedDate}
                  value={selectedDate}
                  className="w-full rounded-md border"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                Study Sessions - {selectedDate.toLocaleDateString()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredSessions.length === 0 ? (
                <p className="text-center text-muted-foreground">
                  No sessions planned for this day
                </p>
              ) : (
                <ul className="space-y-3">
                  {filteredSessions.map((session) => (
                    <li
                      key={session.id}
                      className="flex justify-between items-center border-b pb-2"
                    >
                      <div>
                        <div className="font-medium">{session.subject}</div>
                        <div className="text-sm text-muted-foreground">
                          {formatDuration(session.duration)}
                          {session.notes && ` - ${session.notes}`}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeStudySession(session.id)}
                      >
                        &times;
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StudyPlanner;
