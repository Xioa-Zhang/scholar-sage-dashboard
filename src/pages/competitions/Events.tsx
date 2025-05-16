
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, Clock, Link as LinkIcon, Edit, Trash, ExternalLink } from "lucide-react";
import { useCompetitions, createCompetition, updateCompetition, deleteCompetition } from "@/lib/database";

const categories = [
  { label: "CTF", value: "CTF" },
  { label: "Robotics", value: "Robotics" },
  { label: "Innovation", value: "Innovation" },
  { label: "School", value: "School" },
  { label: "Other", value: "Other" },
];

const Events = () => {
  const { competitions, loading } = useCompetitions();
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");
  const [url, setUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const [categoryFilter, setCategoryFilter] = useState("all");
  
  const handleCreateCompetition = () => {
    if (!name || !startDate) {
      toast({
        title: "Error",
        description: "Name and start date are required",
        variant: "destructive",
      });
      return;
    }
    
    try {
      createCompetition(name, description, startDate, endDate, location, category, url, notes);
      setIsCreateDialogOpen(false);
      resetForm();
      
      toast({
        title: "Success",
        description: `Event "${name}" created successfully`,
      });
      
      // Reload the page to refresh the competitions list
      window.location.reload();
    } catch (error) {
      console.error("Error creating competition:", error);
      toast({
        title: "Error",
        description: "Failed to create event",
        variant: "destructive",
      });
    }
  };

  const handleEditCompetition = () => {
    if (!name || !startDate || !editId) {
      toast({
        title: "Error",
        description: "Name and start date are required",
        variant: "destructive",
      });
      return;
    }
    
    try {
      updateCompetition(editId, name, description, startDate, endDate, location, category, url, notes);
      setIsEditDialogOpen(false);
      resetForm();
      
      toast({
        title: "Success",
        description: `Event "${name}" updated successfully`,
      });
      
      // Reload the page to refresh the competitions list
      window.location.reload();
    } catch (error) {
      console.error("Error updating competition:", error);
      toast({
        title: "Error",
        description: "Failed to update event",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCompetition = (id: number, compName: string) => {
    if (confirm(`Are you sure you want to delete "${compName}"?`)) {
      try {
        deleteCompetition(id);
        
        toast({
          title: "Success",
          description: `Event "${compName}" deleted successfully`,
        });
        
        // Reload the page to refresh the competitions list
        window.location.reload();
      } catch (error) {
        console.error("Error deleting competition:", error);
        toast({
          title: "Error",
          description: "Failed to delete event",
          variant: "destructive",
        });
      }
    }
  };

  const openEditDialog = (competition: any) => {
    setEditId(competition.id);
    setName(competition.name);
    setDescription(competition.description || "");
    setStartDate(competition.start_date || "");
    setEndDate(competition.end_date || "");
    setLocation(competition.location || "");
    setCategory(competition.category || "");
    setUrl(competition.url || "");
    setNotes(competition.notes || "");
    setIsEditDialogOpen(true);
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setStartDate("");
    setEndDate("");
    setLocation("");
    setCategory("");
    setUrl("");
    setNotes("");
    setEditId(null);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
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

  // Filter competitions based on category
  const filteredCompetitions = categoryFilter === "all" 
    ? competitions
    : competitions.filter((comp: any) => comp.category === categoryFilter);

  // Sort by date
  const sortedCompetitions = [...filteredCompetitions].sort((a: any, b: any) => {
    if (!a.start_date) return 1;
    if (!b.start_date) return -1;
    return new Date(a.start_date).getTime() - new Date(b.start_date).getTime();
  });

  // Group competitions into upcoming and past
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const upcomingCompetitions = sortedCompetitions.filter((comp: any) => {
    if (!comp.start_date) return false;
    const startDate = new Date(comp.start_date);
    return startDate >=  today;
  });
  
  const pastCompetitions = sortedCompetitions.filter((comp: any) => {
    if (!comp.start_date) return false;
    const startDate = new Date(comp.start_date);
    return startDate < today;
  });

  const calculateTimeRemaining = (dateString: string) => {
    const eventDate = new Date(dateString).getTime();
    const now = new Date().getTime();
    const distance = eventDate - now;
    
    if (distance < 0) {
      return "Event has started";
    }
    
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    return `${days}d ${hours}h remaining`;
  };

  return (
    <div className="container mx-auto p-4 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Competitions & Events</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Event
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Event</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="name">Event Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Event name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="start-date">Start Date</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-date">End Date (Optional)</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location (Optional)</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Event location"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Event description"
                  rows={2}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="url">URL (Optional)</Label>
                <Input
                  id="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Additional notes"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreateCompetition}>Create Event</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Event</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="edit-name">Event Name</Label>
                <Input
                  id="edit-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-start-date">Start Date</Label>
                <Input
                  id="edit-start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-end-date">End Date (Optional)</Label>
                <Input
                  id="edit-end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-category">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-location">Location (Optional)</Label>
                <Input
                  id="edit-location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="edit-description">Description (Optional)</Label>
                <Textarea
                  id="edit-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="edit-url">URL (Optional)</Label>
                <Input
                  id="edit-url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="edit-notes">Notes (Optional)</Label>
                <Textarea
                  id="edit-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleEditCompetition}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div>
          <Label>Filter by Category</Label>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10">
          <div className="inline-block animate-pulse h-6 w-6 rounded-full bg-primary"></div>
          <p className="mt-2">Loading events...</p>
        </div>
      ) : (
        <Tabs defaultValue="upcoming">
          <TabsList className="mb-4">
            <TabsTrigger value="upcoming">
              Upcoming ({upcomingCompetitions.length})
            </TabsTrigger>
            <TabsTrigger value="past">
              Past ({pastCompetitions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming">
            {upcomingCompetitions.length === 0 ? (
              <div className="text-center py-10 border rounded-lg">
                <div className="mx-auto h-10 w-10 text-muted-foreground">🏆</div>
                <p className="mt-2 text-lg font-medium">No upcoming events</p>
                <p className="text-sm text-muted-foreground">
                  {categoryFilter === "all" 
                    ? "Add a new event to get started" 
                    : "No events found in this category"}
                </p>
                <Button onClick={() => setIsCreateDialogOpen(true)} className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Event
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {upcomingCompetitions.map((competition: any) => (
                  <Card key={competition.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{competition.name}</CardTitle>
                        {competition.category && (
                          <Badge className={getCategoryColor(competition.category)}>
                            {competition.category}
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="space-y-3">
                        {competition.description && (
                          <p className="text-sm text-muted-foreground">
                            {competition.description}
                          </p>
                        )}
                        <div className="flex items-center text-sm">
                          <Calendar className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            {formatDate(competition.start_date)}
                            {competition.end_date && ` - ${formatDate(competition.end_date)}`}
                          </span>
                        </div>
                        {competition.location && (
                          <div className="text-sm text-muted-foreground">
                            Location: {competition.location}
                          </div>
                        )}
                        {competition.start_date && (
                          <div className="flex items-center text-sm font-medium text-primary">
                            <Clock className="h-3.5 w-3.5 mr-1" />
                            {calculateTimeRemaining(competition.start_date)}
                          </div>
                        )}
                        {competition.url && (
                          <div className="text-sm">
                            <a 
                              href={competition.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center text-primary hover:underline"
                            >
                              <LinkIcon className="h-3.5 w-3.5 mr-1" />
                              Visit Website
                              <ExternalLink className="h-3 w-3 ml-1" />
                            </a>
                          </div>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-end border-t pt-2">
                      <div className="flex space-x-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => openEditDialog(competition)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDeleteCompetition(competition.id, competition.name)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="past">
            {pastCompetitions.length === 0 ? (
              <div className="text-center py-10 border rounded-lg">
                <div className="mx-auto h-10 w-10 text-muted-foreground">🗓️</div>
                <p className="mt-2 text-lg font-medium">No past events</p>
                <p className="text-sm text-muted-foreground">
                  Past events will appear here
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pastCompetitions.map((competition: any) => (
                  <Card key={competition.id} className="opacity-80">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{competition.name}</CardTitle>
                        {competition.category && (
                          <Badge className={getCategoryColor(competition.category)}>
                            {competition.category}
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="space-y-3">
                        {competition.description && (
                          <p className="text-sm text-muted-foreground">
                            {competition.description}
                          </p>
                        )}
                        <div className="flex items-center text-sm">
                          <Calendar className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            {formatDate(competition.start_date)}
                            {competition.end_date && ` - ${formatDate(competition.end_date)}`}
                          </span>
                        </div>
                        {competition.location && (
                          <div className="text-sm text-muted-foreground">
                            Location: {competition.location}
                          </div>
                        )}
                        {competition.url && (
                          <div className="text-sm">
                            <a 
                              href={competition.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center text-primary hover:underline"
                            >
                              <LinkIcon className="h-3.5 w-3.5 mr-1" />
                              Visit Website
                              <ExternalLink className="h-3 w-3 ml-1" />
                            </a>
                          </div>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-end border-t pt-2">
                      <div className="flex space-x-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => openEditDialog(competition)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDeleteCompetition(competition.id, competition.name)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default Events;
