
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useSubjects } from "@/lib/database";
import { handleDateChange, formatDuration } from "@/lib/study-utils";
import { PomodoroTimer } from "@/components/study/PomodoroTimer";
import { StudySessionForm } from "@/components/study/StudySessionForm";
import { StudySessionList } from "@/components/study/StudySessionList";
import { DatePickerCard } from "@/components/study/DatePickerCard";

type StudySession = {
  id: number;
  subject: string;
  subjectId: number | string;
  date: string;
  duration: number;
  notes: string;
};

const StudyPlanner = () => {
  const { subjects } = useSubjects();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [studySessions, setStudySessions] = useState<StudySession[]>([]);
  
  useEffect(() => {
    // Load study sessions from local storage
    const savedSessions = localStorage.getItem("studySessions");
    if (savedSessions) {
      setStudySessions(JSON.parse(savedSessions));
    }
  }, []);

  const onDateChange = (value: Date | Date[]) => {
    handleDateChange(value, setSelectedDate);
  };

  const addStudySession = (sessionData: Omit<StudySession, 'id'>) => {
    const newSession = {
      ...sessionData,
      id: Date.now(),
    };
    
    const updatedSessions = [...studySessions, newSession];
    setStudySessions(updatedSessions);
    localStorage.setItem("studySessions", JSON.stringify(updatedSessions));
    
    toast({
      title: "Success",
      description: `Study session for ${sessionData.subject} added successfully`,
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

  return (
    <div className="container mx-auto p-4 animate-fade-in">
      <h1 className="text-2xl font-bold mb-6">Study Planner</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1 md:col-span-2">
          <PomodoroTimer />
          <StudySessionForm 
            subjects={subjects}
            onAddSession={addStudySession}
            selectedDate={selectedDate}
          />
        </div>

        <div>
          <DatePickerCard 
            selectedDate={selectedDate} 
            onDateChange={onDateChange} 
          />
          <StudySessionList 
            sessions={filteredSessions}
            selectedDate={selectedDate}
            onRemoveSession={removeStudySession}
            formatDuration={formatDuration}
          />
        </div>
      </div>
    </div>
  );
};

export default StudyPlanner;
