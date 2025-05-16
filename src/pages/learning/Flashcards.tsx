
import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash, ArrowRight } from "lucide-react";
import { useSubjects, useFlashcards, createFlashcard, deleteFlashcard, updateFlashcard, updateFlashcardReview, getFlashcards } from "@/lib/database";
import { useSearchParams } from "react-router-dom";

const Flashcards = () => {
  const [searchParams] = useSearchParams();
  const initialSubjectId = searchParams.get("subject") ? Number(searchParams.get("subject")) : undefined;
  
  const { subjects } = useSubjects();
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | undefined>(initialSubjectId);
  const { flashcards: allFlashcards, loading } = useFlashcards(selectedSubjectId);
  
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isStudyMode, setIsStudyMode] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [subjectId, setSubjectId] = useState<number | undefined>(initialSubjectId);
  const [editId, setEditId] = useState<number | null>(null);
  
  // For study mode
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [studyFlashcards, setStudyFlashcards] = useState<any[]>([]);
  
  useEffect(() => {
    if (initialSubjectId) {
      setSelectedSubjectId(initialSubjectId);
      setSubjectId(initialSubjectId);
    }
  }, [initialSubjectId]);

  const shuffleArray = (array: any[]) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const startStudyMode = () => {
    if (!allFlashcards || allFlashcards.length === 0) {
      toast({
        title: "No flashcards",
        description: "You need to create flashcards before you can study.",
      });
      return;
    }
    
    setStudyFlashcards(shuffleArray(allFlashcards));
    setCurrentCardIndex(0);
    setShowAnswer(false);
    setIsStudyMode(true);
  };

  const nextCard = () => {
    if (currentCardIndex < studyFlashcards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setShowAnswer(false);
    } else {
      // End of deck
      toast({
        title: "Study session complete",
        description: `You've reviewed all ${studyFlashcards.length} flashcards.`,
      });
      setIsStudyMode(false);
    }
    
    // Mark card as reviewed
    if (studyFlashcards[currentCardIndex]) {
      updateFlashcardReview(studyFlashcards[currentCardIndex].id);
    }
  };

  const handleCreateFlashcard = () => {
    if (!question || !answer || !subjectId) {
      toast({
        title: "Error",
        description: "All fields are required",
        variant: "destructive",
      });
      return;
    }
    
    try {
      createFlashcard(subjectId, question, answer);
      setIsCreateDialogOpen(false);
      setQuestion("");
      setAnswer("");
      
      toast({
        title: "Success",
        description: "Flashcard created successfully",
      });
      
      // Reload the page to refresh the flashcards list
      window.location.reload();
    } catch (error) {
      console.error("Error creating flashcard:", error);
      toast({
        title: "Error",
        description: "Failed to create flashcard",
        variant: "destructive",
      });
    }
  };

  const handleEditFlashcard = () => {
    if (!question || !answer || !editId) {
      toast({
        title: "Error",
        description: "All fields are required",
        variant: "destructive",
      });
      return;
    }
    
    try {
      updateFlashcard(editId, question, answer);
      setIsEditDialogOpen(false);
      setQuestion("");
      setAnswer("");
      setEditId(null);
      
      toast({
        title: "Success",
        description: "Flashcard updated successfully",
      });
      
      // Reload the page to refresh the flashcards list
      window.location.reload();
    } catch (error) {
      console.error("Error updating flashcard:", error);
      toast({
        title: "Error",
        description: "Failed to update flashcard",
        variant: "destructive",
      });
    }
  };

  const handleDeleteFlashcard = (id: number) => {
    if (confirm("Are you sure you want to delete this flashcard?")) {
      try {
        deleteFlashcard(id);
        
        toast({
          title: "Success",
          description: "Flashcard deleted successfully",
        });
        
        // Reload the page to refresh the flashcards list
        window.location.reload();
      } catch (error) {
        console.error("Error deleting flashcard:", error);
        toast({
          title: "Error",
          description: "Failed to delete flashcard",
          variant: "destructive",
        });
      }
    }
  };

  const openEditDialog = (flashcard: any) => {
    setEditId(flashcard.id);
    setQuestion(flashcard.question);
    setAnswer(flashcard.answer);
    setIsEditDialogOpen(true);
  };

  if (isStudyMode && studyFlashcards.length > 0) {
    const currentCard = studyFlashcards[currentCardIndex];
    return (
      <div className="container mx-auto p-4 animate-fade-in">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Study Flashcards</h1>
          <div className="text-sm text-muted-foreground">
            Card {currentCardIndex + 1} of {studyFlashcards.length}
          </div>
        </div>
        
        <div className="flex justify-center">
          <Card className="w-full max-w-2xl min-h-[300px] flex flex-col">
            <CardContent className="p-6 flex-grow flex items-center justify-center">
              <div className="text-center">
                <div className="text-xl mb-8">{currentCard.question}</div>
                {showAnswer ? (
                  <div className="text-xl mt-4 font-medium text-primary animate-fade-in">
                    {currentCard.answer}
                  </div>
                ) : (
                  <Button onClick={() => setShowAnswer(true)}>Show Answer</Button>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t p-4">
              <Button variant="outline" onClick={() => setIsStudyMode(false)}>
                Exit Study Mode
              </Button>
              <Button onClick={nextCard} disabled={!showAnswer}>
                Next Card
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Flashcards</h1>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={startStudyMode}>
            Study Mode
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Flashcard
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Flashcard</DialogTitle>
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
                  <Label htmlFor="question">Question</Label>
                  <Textarea
                    id="question"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Enter the question"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="answer">Answer</Label>
                  <Textarea
                    id="answer"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Enter the answer"
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreateFlashcard}>Create Flashcard</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Flashcard</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-question">Question</Label>
                  <Textarea
                    id="edit-question"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-answer">Answer</Label>
                  <Textarea
                    id="edit-answer"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleEditFlashcard}>Save Changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
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
          <p className="mt-2">Loading flashcards...</p>
        </div>
      ) : (
        <>
          <Tabs defaultValue="cards">
            <div className="flex justify-between items-center mb-4">
              <TabsList>
                <TabsTrigger value="cards">Cards</TabsTrigger>
                <TabsTrigger value="table">Table</TabsTrigger>
              </TabsList>
              <div className="text-sm text-muted-foreground">
                {allFlashcards?.length} {allFlashcards?.length === 1 ? "flashcard" : "flashcards"}
              </div>
            </div>

            <TabsContent value="cards">
              {allFlashcards?.length === 0 ? (
                <div className="text-center py-10 border rounded-lg">
                  <div className="mx-auto h-10 w-10 text-muted-foreground">📇</div>
                  <p className="mt-2 text-lg font-medium">No flashcards found</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedSubjectId 
                      ? "Create your first flashcard for this subject." 
                      : "Select a subject or create a new flashcard."}
                  </p>
                  <Button onClick={() => setIsCreateDialogOpen(true)} className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Flashcard
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {allFlashcards?.map((flashcard: any) => (
                    <Card key={flashcard.id} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="mb-4">
                          <h3 className="font-medium mb-1">Question:</h3>
                          <p>{flashcard.question}</p>
                        </div>
                        <div>
                          <h3 className="font-medium mb-1">Answer:</h3>
                          <p>{flashcard.answer}</p>
                        </div>
                        {flashcard.subject_name && (
                          <div className="mt-3">
                            <span className="px-2 py-1 text-xs rounded-full bg-muted">
                              {flashcard.subject_name}
                            </span>
                          </div>
                        )}
                      </CardContent>
                      <CardFooter className="flex justify-end border-t p-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => openEditDialog(flashcard)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDeleteFlashcard(flashcard.id)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="table">
              {allFlashcards?.length === 0 ? (
                <div className="text-center py-10 border rounded-lg">
                  <div className="mx-auto h-10 w-10 text-muted-foreground">📇</div>
                  <p className="mt-2 text-lg font-medium">No flashcards found</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedSubjectId 
                      ? "Create your first flashcard for this subject." 
                      : "Select a subject or create a new flashcard."}
                  </p>
                  <Button onClick={() => setIsCreateDialogOpen(true)} className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Flashcard
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-muted text-muted-foreground text-sm">
                        <th className="text-left p-3">Question</th>
                        <th className="text-left p-3">Answer</th>
                        {!selectedSubjectId && <th className="text-left p-3">Subject</th>}
                        <th className="text-left p-3 w-24">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {allFlashcards?.map((flashcard: any) => (
                        <tr key={flashcard.id} className="hover:bg-muted/50">
                          <td className="p-3">{flashcard.question}</td>
                          <td className="p-3">{flashcard.answer}</td>
                          {!selectedSubjectId && (
                            <td className="p-3">
                              {flashcard.subject_name || "Unknown Subject"}
                            </td>
                          )}
                          <td className="p-3">
                            <div className="flex space-x-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => openEditDialog(flashcard)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => handleDeleteFlashcard(flashcard.id)}
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};

export default Flashcards;
