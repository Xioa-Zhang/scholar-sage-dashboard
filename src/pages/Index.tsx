
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  CalendarDays, 
  ListChecks, 
  Clock, 
  List, 
  CalendarClock, 
  Calendar 
} from "lucide-react";
import { Link } from "react-router-dom";
import { useSubjects, useTasks, useCompetitions, useNotes } from "@/lib/database";
import { useEffect, useState } from "react";

const Index = () => {
  const { subjects } = useSubjects();
  const { tasks } = useTasks();
  const { competitions } = useCompetitions();
  const { notes } = useNotes();
  const [upcomingTasks, setUpcomingTasks] = useState<any[]>([]);
  const [upcomingCompetitions, setUpcomingCompetitions] = useState<any[]>([]);
  const [today] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    // Get upcoming tasks (due within the next week)
    const oneWeekFromNow = new Date();
    oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);
    const oneWeekFromNowStr = oneWeekFromNow.toISOString().split('T')[0];
    
    setUpcomingTasks(tasks.filter((task: any) => 
      task.status !== 'completed' && 
      task.due_date && 
      task.due_date >= today && 
      task.due_date <= oneWeekFromNowStr
    ).slice(0, 5));

    // Get upcoming competitions
    setUpcomingCompetitions(competitions.filter((comp: any) => 
      comp.start_date && comp.start_date >= today
    ).slice(0, 3));
  }, [tasks, competitions, today]);

  return (
    <div className="container mx-auto p-4 animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Learning</CardTitle>
            <CardDescription>Manage your studies</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div className="text-3xl font-bold">{subjects.length}</div>
              <div className="text-muted-foreground">Subjects</div>
            </div>
            <div className="flex justify-between items-center mt-4">
              <div className="text-3xl font-bold">{notes.length}</div>
              <div className="text-muted-foreground">Notes</div>
            </div>
            <div className="mt-4">
              <Button asChild variant="outline" className="w-full">
                <Link to="/learning/subjects">
                  <List className="mr-2 h-4 w-4" />
                  View Subjects
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Tasks</CardTitle>
            <CardDescription>Upcoming deadlines</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div className="text-3xl font-bold">
                {tasks.filter((t: any) => t.status !== 'completed').length}
              </div>
              <div className="text-muted-foreground">Active Tasks</div>
            </div>
            <div className="mt-4">
              <Button asChild variant="outline" className="w-full">
                <Link to="/tasks/todo">
                  <ListChecks className="mr-2 h-4 w-4" />
                  View Tasks
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Competitions</CardTitle>
            <CardDescription>Upcoming events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div className="text-3xl font-bold">
                {competitions.filter((c: any) => c.start_date && c.start_date >= today).length}
              </div>
              <div className="text-muted-foreground">Upcoming</div>
            </div>
            <div className="mt-4">
              <Button asChild variant="outline" className="w-full">
                <Link to="/competitions/events">
                  <Calendar className="mr-2 h-4 w-4" />
                  View Events
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CalendarClock className="mr-2 h-5 w-5" />
              Upcoming Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingTasks.length > 0 ? (
              <ul className="space-y-3">
                {upcomingTasks.map((task) => (
                  <li key={task.id} className="flex justify-between items-center border-b pb-2">
                    <div>
                      <div className="font-medium">{task.title}</div>
                      <div className="text-sm text-muted-foreground">
                        Due: {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No date'}
                      </div>
                    </div>
                    <div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        task.priority === 'high' 
                          ? 'bg-red-100 text-red-800' 
                          : task.priority === 'medium' 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {task.priority}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-muted-foreground">No upcoming tasks</p>
            )}
            <Button asChild variant="link" className="mt-4 pl-0">
              <Link to="/tasks/todo">View all tasks</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="mr-2 h-5 w-5" />
              Upcoming Competitions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingCompetitions.length > 0 ? (
              <ul className="space-y-3">
                {upcomingCompetitions.map((comp) => (
                  <li key={comp.id} className="flex justify-between items-center border-b pb-2">
                    <div>
                      <div className="font-medium">{comp.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {comp.start_date ? new Date(comp.start_date).toLocaleDateString() : 'No date'}
                      </div>
                    </div>
                    <div>
                      <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                        {comp.category || 'General'}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-muted-foreground">No upcoming competitions</p>
            )}
            <Button asChild variant="link" className="mt-4 pl-0">
              <Link to="/competitions/events">View all competitions</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
