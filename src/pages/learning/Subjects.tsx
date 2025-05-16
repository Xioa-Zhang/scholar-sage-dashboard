
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { List, Plus, Edit, Trash } from "lucide-react";
import { useSubjects, createSubject, deleteSubject, updateSubject } from "@/lib/database";

const Subjects = () => {
  const { subjects, loading } = useSubjects();
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#4F46E5");
  const [editId, setEditId] = useState<number | null>(null);

  const handleCreateSubject = () => {
    if (!name) {
      toast({
        title: "Error",
        description: "Subject name is required",
        variant: "destructive",
      });
      return;
    }
    
    try {
      createSubject(name, description, color);
      setIsCreateDialogOpen(false);
      setName("");
      setDescription("");
      setColor("#4F46E5");
      
      toast({
        title: "Success",
        description: `Subject "${name}" created successfully`,
      });
      
      // Reload the page to refresh the subjects list
      window.location.reload();
    } catch (error) {
      console.error("Error creating subject:", error);
      toast({
        title: "Error",
        description: "Failed to create subject",
        variant: "destructive",
      });
    }
  };

  const handleEditSubject = () => {
    if (!name || !editId) {
      toast({
        title: "Error",
        description: "Subject name is required",
        variant: "destructive",
      });
      return;
    }
    
    try {
      updateSubject(editId, name, description, color);
      setIsEditDialogOpen(false);
      setName("");
      setDescription("");
      setColor("#4F46E5");
      setEditId(null);
      
      toast({
        title: "Success",
        description: `Subject "${name}" updated successfully`,
      });
      
      // Reload the page to refresh the subjects list
      window.location.reload();
    } catch (error) {
      console.error("Error updating subject:", error);
      toast({
        title: "Error",
        description: "Failed to update subject",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSubject = (id: number, subjectName: string) => {
    if (confirm(`Are you sure you want to delete "${subjectName}"? This will also delete all associated notes and flashcards.`)) {
      try {
        deleteSubject(id);
        
        toast({
          title: "Success",
          description: `Subject "${subjectName}" deleted successfully`,
        });
        
        // Reload the page to refresh the subjects list
        window.location.reload();
      } catch (error) {
        console.error("Error deleting subject:", error);
        toast({
          title: "Error",
          description: "Failed to delete subject",
          variant: "destructive",
        });
      }
    }
  };

  const openEditDialog = (subject: any) => {
    setEditId(subject.id);
    setName(subject.name);
    setDescription(subject.description || "");
    setColor(subject.color || "#4F46E5");
    setIsEditDialogOpen(true);
  };

  return (
    <div className="container mx-auto p-4 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Subjects</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Subject
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Subject</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Subject Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Python, History, Math"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="A brief description of this subject"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="color">Color</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="color"
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-16 h-10"
                  />
                  <span className="text-sm text-muted-foreground">
                    Choose a color for this subject
                  </span>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreateSubject}>Create Subject</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Subject</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Subject Name</Label>
                <Input
                  id="edit-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description (Optional)</Label>
                <Textarea
                  id="edit-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-color">Color</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="edit-color"
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-16 h-10"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleEditSubject}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-center py-10">
          <div className="inline-block animate-pulse h-6 w-6 rounded-full bg-primary"></div>
          <p className="mt-2">Loading subjects...</p>
        </div>
      ) : (
        <Tabs defaultValue="grid">
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="grid">Grid</TabsTrigger>
              <TabsTrigger value="list">List</TabsTrigger>
            </TabsList>
            <div className="text-sm text-muted-foreground">
              {subjects.length} {subjects.length === 1 ? "subject" : "subjects"}
            </div>
          </div>

          <TabsContent value="grid">
            {subjects.length === 0 ? (
              <div className="text-center py-10 border rounded-lg">
                <List className="mx-auto h-10 w-10 text-muted-foreground" />
                <p className="mt-2 text-lg font-medium">No subjects found</p>
                <p className="text-sm text-muted-foreground">
                  Create your first subject to get started.
                </p>
                <Button onClick={() => setIsCreateDialogOpen(true)} className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Subject
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {subjects.map((subject: any) => (
                  <Card key={subject.id} className="overflow-hidden">
                    <div 
                      className="h-2" 
                      style={{ backgroundColor: subject.color || "#4F46E5" }}
                    />
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium">{subject.name}</h3>
                        <div className="flex space-x-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => openEditDialog(subject)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDeleteSubject(subject.id, subject.name)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      {subject.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {subject.description}
                        </p>
                      )}
                      <div className="mt-3 flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <a href={`/learning/notes?subject=${subject.id}`}>Notes</a>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <a href={`/learning/flashcards?subject=${subject.id}`}>Flashcards</a>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="list">
            {subjects.length === 0 ? (
              <div className="text-center py-10 border rounded-lg">
                <List className="mx-auto h-10 w-10 text-muted-foreground" />
                <p className="mt-2 text-lg font-medium">No subjects found</p>
                <p className="text-sm text-muted-foreground">
                  Create your first subject to get started.
                </p>
                <Button onClick={() => setIsCreateDialogOpen(true)} className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Subject
                </Button>
              </div>
            ) : (
              <div className="border rounded-lg divide-y overflow-hidden">
                {subjects.map((subject: any) => (
                  <div
                    key={subject.id}
                    className="p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      <div
                        className="h-4 w-4 rounded-full mr-4"
                        style={{ backgroundColor: subject.color || "#4F46E5" }}
                      />
                      <div>
                        <h3 className="font-medium">{subject.name}</h3>
                        {subject.description && (
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {subject.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" asChild>
                        <a href={`/learning/notes?subject=${subject.id}`}>Notes</a>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <a href={`/learning/flashcards?subject=${subject.id}`}>Flashcards</a>
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => openEditDialog(subject)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDeleteSubject(subject.id, subject.name)}
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

export default Subjects;
