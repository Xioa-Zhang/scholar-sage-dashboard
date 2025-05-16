import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as DatePicker } from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { Badge } from "@/components/ui/badge";
import { useTasks } from "@/lib/database";
import { useCompetitions } from "@/lib/database";

import './calendar.css'; // We'll create this file for custom styles

const Calendar = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const { tasks } = useTasks();
  const { competitions } = useCompetitions();
  const [events, setEvents] = useState<any[]>([]);

  // Fix DatePicker onChange type
  const handleDateChange = (value: Date | Date[]) => {
    // Ensure we're working with a single date
    if (Array.isArray(value)) {
      setSelectedDate(value[0]);
    } else {
      setSelectedDate(value);
    }
  };

  useEffect(() => {
    // Combine tasks and competitions into events
    const allEvents: any[] = [];
    
    // Add tasks with due dates
    tasks.forEach((task: any) => {
      if (task.due_date) {
        allEvents.push({
          id: `task-${task.id}`,
          title: task.title,
          date: new Date(task.due_date),
          type: 'task',
          status: task.status,
          priority: task.priority,
          tag: task.tag,
        });
      }
    });
    
    // Add competitions
    competitions.forEach((comp: any) => {
      if (comp.start_date) {
        allEvents.push({
          id: `comp-${comp.id}`,
          title: comp.name,
          date: new Date(comp.start_date),
          endDate: comp.end_date ? new Date(comp.end_date) : null,
          type: 'competition',
          category: comp.category,
        });
      }
    });
    
    setEvents(allEvents);
  }, [tasks, competitions]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const isSameDay = (date1: Date, date2: Date) => {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  };

  const eventsForSelectedDate = events.filter((event) => 
    isSameDay(event.date, selectedDate)
  );

  const getTagColor = (tag: string) => {
    switch (tag) {
      case 'school':
        return 'bg-blue-100 text-blue-800';
      case 'dev':
        return 'bg-purple-100 text-purple-800';
      case 'comp':
        return 'bg-orange-100 text-orange-800';
      case 'personal':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'CTF':
        return 'bg-red-100 text-red-800';
      case 'Robotics':
        return 'bg-blue-100 text-blue-800';
      case 'Innovation':
        return 'bg-purple-100 text-purple-800';
      case 'School':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Function to render custom content in calendar tiles
  const tileContent = ({ date }: { date: Date }) => {
    const eventsForDate = events.filter(event => isSameDay(event.date, date));
    
    if (eventsForDate.length === 0) return null;
    
    const taskCount = eventsForDate.filter(e => e.type === 'task').length;
    const compCount = eventsForDate.filter(e => e.type === 'competition').length;
    
    return (
      <div className="flex flex-wrap gap-1 mt-1 justify-center">
        {taskCount > 0 && (
          <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
        )}
        {compCount > 0 && (
          <div className="h-1.5 w-1.5 rounded-full bg-secondary"></div>
        )}
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4 animate-fade-in">
      <h1 className="text-2xl font-bold mb-6">Calendar</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Events Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="custom-calendar">
                <DatePicker
                  onChange={handleDateChange}
                  value={selectedDate}
                  className="w-full border rounded-md"
                  tileContent={tileContent}
                />
              </div>
              
              <div className="mt-4 flex items-center justify-center space-x-6">
                <div className="flex items-center space-x-2">
                  <div className="h-3 w-3 rounded-full bg-primary"></div>
                  <span className="text-sm text-muted-foreground">Tasks</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="h-3 w-3 rounded-full bg-secondary"></div>
                  <span className="text-sm text-muted-foreground">Competitions</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>
                Events for {formatDate(selectedDate)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {eventsForSelectedDate.length === 0 ? (
                <p className="text-center text-muted-foreground">
                  No events scheduled for this day
                </p>
              ) : (
                <ul className="space-y-3">
                  {eventsForSelectedDate.map((event) => (
                    <li
                      key={event.id}
                      className="border-b pb-2"
                    >
                      <div className="font-medium flex items-center justify-between">
                        <span>{event.title}</span>
                        <Badge className={event.type === 'task' ? getPriorityColor(event.priority) : getCategoryColor(event.category)}>
                          {event.type === 'task' ? event.priority : event.category || 'General'}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1 flex justify-between">
                        <span>
                          {event.type === 'task' ? 'Task' : 'Competition'}
                          {event.type === 'task' && event.status === 'completed' && ' • Completed'}
                        </span>
                        {(event.tag || event.category) && (
                          <Badge variant="outline" className={event.type === 'task' ? getTagColor(event.tag) : ''}>
                            {event.tag || event.category}
                          </Badge>
                        )}
                      </div>
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

export default Calendar;
