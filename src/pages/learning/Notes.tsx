
import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit, Trash, Calendar, FileText } from "lucide-react";
import { useSubjects, useNotes, createNote, deleteNote, updateNote } from "@/lib/database";
import ReactMarkdown from "react-markdown";
import { useSearchParams } from "react-router-dom";

const Notes = () => {
  const [searchParams] = useSearchParams();
  const initialSubjectId = searchParams.get("subject") ? Number(searchParams.get("subject")) : undefined;
  
  const { subjects } = useSubjects();
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | undefined>(initialSubjectId);
  const { notes, loading } = useNotes(selectedSubjectId);
  
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [subjectId, setSubjectId] = useState<number | undefined>(initialSubjectId);
  const [editId, setEditId] = useState<number | null>(null);
  const [viewNote, setViewNote] = useState<any>(null);
  
  useEffect(() => {
    if (initialSubjectId) {
      setSelectedSubjectId(initialSubjectId);
      setSubjectId(initialSubjectId);
    }
  }, [initialSubjectId]);

  const handleCreateNote = () => {
    if (!title || !subjectId) {
      toast({
        title: "Error",
        description: "Title and subject are required",
        variant: "destructive",
      });
      return;
    }
    
    try {
      createNote(subjectId, title, content);
      setIsCreateDialogOpen(false);
      setTitle("");
      setContent("");
      
      toast({
        title: "Success",
        description: `Note "${title}" created successfully`,
      });
      
      // Reload the page to refresh the notes list
      window.location.reload();
    } catch (error) {
      console.error("Error creating note:", error);
      toast({
        title: "Error",
        description: "Failed to create note",
        variant: "destructive",
      });
    }
  };

  const handleEditNote = () => {
    if (!title || !editId) {
      toast({
        title: "Error",
        description: "Title is required",
        variant: "destructive",
      });
      return;
    }
    
    try {
      updateNote(editId, title, content);
      setIsEditDialogOpen(false);
      setTitle("");
      setContent("");
      setEditId(null);
      
      toast({
        title: "Success",
        description: `Note "${title}" updated successfully`,
      });
      
      // Reload the page to refresh the notes list
      window.location.reload();
    } catch (error) {
      console.error("Error updating note:", error);
      toast({
        title: "Error",
        description: "Failed to update note",
        variant: "destructive",
      });
    }
  };

  const handleDeleteNote = (id: number, noteTitle: string) => {
    if (confirm(`Are you sure you want to delete "${noteTitle}"?`)) {
      try {
        deleteNote(id);
        
        toast({
          title: "Success",
          description: `Note "${noteTitle}" deleted successfully`,
        });
        
        // Reload the page to refresh the notes list
        window.location.reload();
      } catch (error) {
        console.error("Error deleting note:", error);
        toast({
          title: "Error",
          description: "Failed to delete note",
          variant: "destructive",
        });
      }
    }
  };

  const openEditDialog = (note: any) => {
    setEditId(note.id);
    setTitle(note.title);
    setContent(note.content || "");
    setIsEditDialogOpen(true);
  };

  const openViewDialog = (note: any) => {
    setViewNote(note);
    setIsViewDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="container mx-auto p-4 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Notes</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Note
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Note</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Select 
                  value={subjectId?.toString() || ""} 
                  onValueChange={(value) => setSubjectId(Number(value))}
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
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Note title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Content (Markdown supported)</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your note content here..."
                  className="min-h-[200px] font-mono"
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreateNote}>Create Note</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Note</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-content">Content (Markdown supported)</Label>
                <Textarea
                  id="edit-content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[200px] font-mono"
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleEditNote}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>{viewNote?.title}</DialogTitle>
            </DialogHeader>
            <div className="text-sm text-muted-foreground mb-4 flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              {viewNote && formatDate(viewNote.updated_at || viewNote.created_at)}
            </div>
            <div className="markdown-content prose dark:prose-invert max-w-none">
              {viewNote && (
                <ReactMarkdown>{viewNote.content || ""}</ReactMarkdown>
              )}
            </div>
            <DialogFooter>
              <Button onClick={() => setIsViewDialogOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-6">
        <Label htmlFor="subject-filter">Filter by Subject</Label>
        <div className="flex gap-4 mt-2">
          <Select 
            value={selectedSubjectId?.toString() || ""} 
            onValueChange={(value) => {
              setSelectedSubjectId(value ? Number(value) : undefined);
            }}
          >
            <SelectTrigger className="w-64">
              <SelectValue placeholder="All Subjects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Subjects</SelectItem>
              {subjects.map((subject: any) => (
                <SelectItem key={subject.id} value={subject.id.toString()}>
                  {subject.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10">
          <div className="inline-block animate-pulse h-6 w-6 rounded-full bg-primary"></div>
          <p className="mt-2">Loading notes...</p>
        </div>
      ) : (
        <Tabs defaultValue="cards">
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="cards">Cards</TabsTrigger>
              <TabsTrigger value="list">List</TabsTrigger>
            </TabsList>
            <div className="text-sm text-muted-foreground">
              {notes.length} {notes.length === 1 ? "note" : "notes"}
            </div>
          </div>

          <TabsContent value="cards">
            {notes.length === 0 ? (
              <div className="text-center py-10 border rounded-lg">
                <FileText className="mx-auto h-10 w-10 text-muted-foreground" />
                <p className="mt-2 text-lg font-medium">No notes found</p>
                <p className="text-sm text-muted-foreground">
                  {selectedSubjectId 
                    ? "Create your first note for this subject." 
                    : "Select a subject or create a new note."}
                </p>
                <Button onClick={() => setIsCreateDialogOpen(true)} className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Note
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {notes.map((note: any) => (
                  <Card key={note.id} className="flex flex-col">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{note.title}</CardTitle>
                      <div className="text-sm text-muted-foreground flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDate(note.updated_at || note.created_at)}
                      </div>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <div className="prose dark:prose-invert max-w-none line-clamp-3 text-sm text-muted-foreground">
                        {note.content ? (
                          <ReactMarkdown>{note.content}</ReactMarkdown>
                        ) : (
                          <p>No content</p>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between pt-2 border-t">
                      <Button variant="outline" size="sm" onClick={() => openViewDialog(note)}>
                        View
                      </Button>
                      <div className="flex space-x-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => openEditDialog(note)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDeleteNote(note.id, note.title)}
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

          <TabsContent value="list">
            {notes.length === 0 ? (
              <div className="text-center py-10 border rounded-lg">
                <FileText className="mx-auto h-10 w-10 text-muted-foreground" />
                <p className="mt-2 text-lg font-medium">No notes found</p>
                <p className="text-sm text-muted-foreground">
                  {selectedSubjectId 
                    ? "Create your first note for this subject." 
                    : "Select a subject or create a new note."}
                </p>
                <Button onClick={() => setIsCreateDialogOpen(true)} className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Note
                </Button>
              </div>
            ) : (
              <div className="border rounded-lg divide-y overflow-hidden">
                {notes.map((note: any) => (
                  <div
                    key={note.id}
                    className="p-4 flex items-center justify-between"
                  >
                    <div className="flex-1">
                      <h3 className="font-medium">{note.title}</h3>
                      <div className="flex items-center text-sm text-muted-foreground mt-1">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDate(note.updated_at || note.created_at)}
                        {note.subject_name && (
                          <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-muted">
                            {note.subject_name}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => openViewDialog(note)}>
                        View
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => openEditDialog(note)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDeleteNote(note.id, note.title)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default Notes;
