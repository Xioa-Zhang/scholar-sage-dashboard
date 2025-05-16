
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useCompetitions } from "@/lib/database";

const Countdown = () => {
  const { competitions } = useCompetitions();
  const [selectedCompId, setSelectedCompId] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  
  // Filter for upcoming competitions only
  const upcomingCompetitions = competitions.filter((comp: any) => {
    if (!comp.start_date) return false;
    return new Date(comp.start_date) > new Date();
  });
  
  // Sort by closest first
  const sortedCompetitions = [...upcomingCompetitions].sort((a: any, b: any) => {
    if (!a.start_date) return 1;
    if (!b.start_date) return -1;
    return new Date(a.start_date).getTime() - new Date(b.start_date).getTime();
  });
  
  // Use the first competition by default
  useEffect(() => {
    if (sortedCompetitions.length > 0 && !selectedCompId) {
      setSelectedCompId(sortedCompetitions[0].id.toString());
    }
  }, [sortedCompetitions, selectedCompId]);
  
  // Update the countdown timer
  useEffect(() => {
    if (!selectedCompId) return;
    
    const selectedComp = competitions.find((c: any) => c.id.toString() === selectedCompId);
    if (!selectedComp || !selectedComp.start_date) return;
    
    const targetDate = new Date(selectedComp.start_date).getTime();
    
    const updateTimer = () => {
      const now = new Date().getTime();
      const distance = targetDate - now;
      
      if (distance < 0) {
        // Event has started
        setTimeRemaining({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0
        });
        return;
      }
      
      setTimeRemaining({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      });
    };
    
    // Update immediately and then every second
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    
    return () => clearInterval(interval);
  }, [selectedCompId, competitions]);
  
  const selectedComp = competitions.find((c: any) => c.id.toString() === selectedCompId);
  
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const getCategoryColor = (categoryValue: string) => {
    switch (categoryValue) {
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

  return (
    <div className="container mx-auto p-4 animate-fade-in">
      <h1 className="text-2xl font-bold mb-6">Event Countdown</h1>
      
      <div className="max-w-3xl mx-auto">
        {sortedCompetitions.length === 0 ? (
          <Card className="text-center py-10">
            <CardContent>
              <div className="mx-auto h-16 w-16 text-muted-foreground text-5xl">⏳</div>
              <p className="mt-4 text-xl font-medium">No upcoming events found</p>
              <p className="mt-2 text-muted-foreground">
                Add events in the Events section to see countdowns
              </p>
              <a 
                href="/competitions/events" 
                className="mt-4 inline-block text-primary underline"
              >
                Go to Events
              </a>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="mb-6">
              <Select 
                value={selectedCompId?.toString() || ""} 
                onValueChange={setSelectedCompId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an event" />
                </SelectTrigger>
                <SelectContent>
                  {sortedCompetitions.map((comp: any) => (
                    <SelectItem key={comp.id} value={comp.id.toString()}>
                      {comp.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {selectedComp && (
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">{selectedComp.name}</CardTitle>
                    {selectedComp.category && (
                      <Badge className={getCategoryColor(selectedComp.category)}>
                        {selectedComp.category}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Starts: {formatDate(selectedComp.start_date)}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div className="p-4">
                      <div className="text-3xl md:text-5xl font-bold">{String(timeRemaining.days).padStart(2, '0')}</div>
                      <div className="text-xs md:text-sm mt-2 text-muted-foreground">DAYS</div>
                    </div>
                    <div className="p-4">
                      <div className="text-3xl md:text-5xl font-bold">{String(timeRemaining.hours).padStart(2, '0')}</div>
                      <div className="text-xs md:text-sm mt-2 text-muted-foreground">HOURS</div>
                    </div>
                    <div className="p-4">
                      <div className="text-3xl md:text-5xl font-bold">{String(timeRemaining.minutes).padStart(2, '0')}</div>
                      <div className="text-xs md:text-sm mt-2 text-muted-foreground">MINUTES</div>
                    </div>
                    <div className="p-4">
                      <div className="text-3xl md:text-5xl font-bold">{String(timeRemaining.seconds).padStart(2, '0')}</div>
                      <div className="text-xs md:text-sm mt-2 text-muted-foreground">SECONDS</div>
                    </div>
                  </div>
                  
                  {selectedComp.description && (
                    <div className="mt-6 p-4 bg-muted rounded-lg">
                      <h3 className="font-medium mb-2">Description</h3>
                      <p className="text-muted-foreground text-sm">{selectedComp.description}</p>
                    </div>
                  )}
                  
                  {selectedComp.location && (
                    <div className="mt-4 text-sm">
                      <span className="font-medium">Location:</span> {selectedComp.location}
                    </div>
                  )}
                  
                  {selectedComp.url && (
                    <div className="mt-4">
                      <a 
                        href={selectedComp.url} 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline text-sm"
                      >
                        Visit event website
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
            
            <div className="mt-6">
              <h2 className="text-lg font-medium mb-4">Other Upcoming Events</h2>
              <div className="space-y-2">
                {sortedCompetitions
                  .filter((comp: any) => comp.id.toString() !== selectedCompId)
                  .slice(0, 3)
                  .map((comp: any) => (
                    <div 
                      key={comp.id} 
                      className="p-3 border rounded-lg flex justify-between items-center cursor-pointer hover:bg-muted/50"
                      onClick={() => setSelectedCompId(comp.id.toString())}
                    >
                      <div>
                        <div className="font-medium">{comp.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {formatDate(comp.start_date).split(',')[0]}
                        </div>
                      </div>
                      {comp.category && (
                        <Badge className={getCategoryColor(comp.category)}>
                          {comp.category}
                        </Badge>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Countdown;
