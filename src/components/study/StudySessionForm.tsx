
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Subject = {
  id: number | string;
  name: string;
};

type StudySessionFormProps = {
  subjects: Subject[];
  onAddSession: (session: {
    subject: string;
    subjectId: number | string;
    duration: number;
    notes: string;
    date: string;
  }) => void;
  selectedDate: Date;
};

export const StudySessionForm = ({ subjects, onAddSession, selectedDate }: StudySessionFormProps) => {
  const { toast } = useToast();
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [studyHours, setStudyHours] = useState<number>(1);
  const [studyMinutes, setStudyMinutes] = useState<number>(0);
  const [notes, setNotes] = useState<string>("");

  const handleAddSession = () => {
    if (!selectedSubjectId) {
      toast({
        title: "Error",
        description: "Please select a subject",
        variant: "destructive",
      });
      return;
    }
    
    const subject = subjects.find((s) => s.id.toString() === selectedSubjectId);
    
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
    
    onAddSession({
      subject: subject.name,
      subjectId: subject.id,
      duration: totalMinutes,
      notes,
      date: selectedDate.toISOString(),
    });
    
    // Reset form
    setNotes("");
  };

  return (
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
                {subjects.map((subject) => (
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
          <Button onClick={handleAddSession}>Add Study Session</Button>
        </div>
      </CardContent>
    </Card>
  );
};
