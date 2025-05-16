
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type StudySession = {
  id: number;
  subject: string;
  duration: number;
  notes?: string;
};

type StudySessionListProps = {
  sessions: StudySession[];
  selectedDate: Date;
  onRemoveSession: (id: number) => void;
  formatDuration: (minutes: number) => string;
};

export const StudySessionList = ({ sessions, selectedDate, onRemoveSession, formatDuration }: StudySessionListProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Study Sessions - {selectedDate.toLocaleDateString()}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {sessions.length === 0 ? (
          <p className="text-center text-muted-foreground">
            No sessions planned for this day
          </p>
        ) : (
          <ul className="space-y-3">
            {sessions.map((session) => (
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
                  onClick={() => onRemoveSession(session.id)}
                >
                  &times;
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};
