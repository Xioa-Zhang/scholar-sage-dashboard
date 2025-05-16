
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Calendar, Clock, Edit, Trash } from "lucide-react";
import { useTasks, createTask, updateTask, updateTaskStatus, deleteTask } from "@/lib/database";

const priorities = [
  { label: "High", value: "high", color: "bg-red-100 text-red-800" },
  { label: "Medium", value: "medium", color: "bg-yellow-100 text-yellow-800" },
  { label: "Low", value: "low", color: "bg-green-100 text-green-800" },
];

const tags = [
  { label: "School", value: "school", color: "bg-blue-100 text-blue-800" },
  { label: "Dev", value: "dev", color: "bg-purple-100 text-purple-800" },
  { label: "Comp", value: "comp", color: "bg-orange-100 text-orange-800" },
  { label: "Personal", value: "personal", color: "bg-green-100 text-green-800" },
];

const TodoList = () => {
  const { tasks, loading } = useTasks();
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("medium");
  const [tag, setTag] = useState("school");
  const [editId, setEditId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [tagFilter, setTagFilter] = useState("all");
  
  const handleCreateTask = () => {
    if (!title) {
      toast({
        title: "Error",
        description: "Task title is required",
        variant: "destructive",
      });
      return;
    }
    
    try {
      createTask(title, description, dueDate, priority, tag);
      setIsCreateDialogOpen(false);
      resetForm();
      
      toast({
        title: "Success",
        description: `Task "${title}" created successfully`,
      });
      
      // Reload the page to refresh the tasks list
      window.location.reload();
    } catch (error) {
      console.error("Error creating task:", error);
      toast({
        title: "Error",
        description: "Failed to create task",
        variant: "destructive",
      });
    }
  };

  const handleEditTask = () => {
    if (!title || !editId) {
      toast({
        title: "Error",
        description: "Task title is required",
        variant: "destructive",
      });
      return;
    }
    
    try {
      updateTask(editId, title, description, dueDate, priority, tag);
      setIsEditDialogOpen(false);
      resetForm();
      
      toast({
        title: "Success",
        description: `Task "${title}" updated successfully`,
      });
      
      // Reload the page to refresh the tasks list
      window.location.reload();
    } catch (error) {
      console.error("Error updating task:", error);
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTask = (id: number, taskTitle: string) => {
    if (confirm(`Are you sure you want to delete "${taskTitle}"?`)) {
      try {
        deleteTask(id);
        
        toast({
          title: "Success",
          description: `Task "${taskTitle}" deleted successfully`,
        });
        
        // Reload the page to refresh the tasks list
        window.location.reload();
      } catch (error) {
        console.error("Error deleting task:", error);
        toast({
          title: "Error",
          description: "Failed to delete task",
          variant: "destructive",
        });
      }
    }
  };

  const handleToggleTaskStatus = (id: number, currentStatus: string) => {
    try {
      const newStatus = currentStatus === "completed" ? "pending" : "completed";
      updateTaskStatus(id, newStatus);
      
      toast({
        title: "Success",
        description: `Task marked as ${newStatus}`,
      });
      
      // Reload the page to refresh the tasks list
      window.location.reload();
    } catch (error) {
      console.error("Error updating task status:", error);
      toast({
        title: "Error",
        description: "Failed to update task status",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (task: any) => {
    setEditId(task.id);
    setTitle(task.title);
    setDescription(task.description || "");
    setDueDate(task.due_date || "");
    setPriority(task.priority || "medium");
    setTag(task.tag || "school");
    setIsEditDialogOpen(true);
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setDueDate("");
    setPriority("medium");
    setTag("school");
    setEditId(null);
  };

  const getPriorityBadge = (priorityValue: string) => {
    const priority = priorities.find((p) => p.value === priorityValue);
    return (
      <Badge className={priority?.color || ""} variant="outline">
        {priority?.label || priorityValue}
      </Badge>
    );
  };

  const getTagBadge = (tagValue: string) => {
    const tag = tags.find((t) => t.value === tagValue);
    return (
      <Badge className={tag?.color || ""} variant="outline">
        {tag?.label || tagValue}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "No due date";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const isOverdue = (task: any) => {
    if (!task.due_date || task.status === "completed") return false;
    const dueDate = new Date(task.due_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return dueDate < today;
  };

  const filteredTasks = tasks.filter((task: any) => {
    if (statusFilter !== "all" && task.status !== statusFilter) return false;
    if (tagFilter !== "all" && task.tag !== tagFilter) return false;
    return true;
  });

  const pendingTasks = filteredTasks.filter((task: any) => task.status !== "completed");
  const completedTasks = filteredTasks.filter((task: any) => task.status === "completed");

  return (
    <div className="container mx-auto p-4 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Todo List</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Task title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Task description"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="due-date">Due Date (Optional)</Label>
                <Input
                  id="due-date"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <RadioGroup
                  value={priority}
                  onValueChange={setPriority}
                  className="flex space-x-2"
                >
                  {priorities.map((p) => (
                    <div key={p.value} className="flex items-center space-x-1">
                      <RadioGroupItem value={p.value} id={p.value} />
                      <Label htmlFor={p.value}>{p.label}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tag">Tag</Label>
                <Select value={tag} onValueChange={setTag}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a tag" />
                  </SelectTrigger>
                  <SelectContent>
                    {tags.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreateTask}>Create Task</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Task</DialogTitle>
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
                <Label htmlFor="edit-description">Description (Optional)</Label>
                <Textarea
                  id="edit-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-due-date">Due Date (Optional)</Label>
                <Input
                  id="edit-due-date"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-priority">Priority</Label>
                <RadioGroup
                  value={priority}
                  onValueChange={setPriority}
                  className="flex space-x-2"
                >
                  {priorities.map((p) => (
                    <div key={p.value} className="flex items-center space-x-1">
                      <RadioGroupItem value={p.value} id={`edit-${p.value}`} />
                      <Label htmlFor={`edit-${p.value}`}>{p.label}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-tag">Tag</Label>
                <Select value={tag} onValueChange={setTag}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a tag" />
                  </SelectTrigger>
                  <SelectContent>
                    {tags.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleEditTask}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div>
          <Label>Filter by Status</Label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Filter by Tag</Label>
          <Select value={tagFilter} onValueChange={setTagFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {tags.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10">
          <div className="inline-block animate-pulse h-6 w-6 rounded-full bg-primary"></div>
          <p className="mt-2">Loading tasks...</p>
        </div>
      ) : (
        <Tabs defaultValue="active">
          <TabsList className="mb-4">
            <TabsTrigger value="active">
              Active ({pendingTasks.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({completedTasks.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active">
            {pendingTasks.length === 0 ? (
              <div className="text-center py-10 border rounded-lg">
                <div className="mx-auto h-10 w-10 text-muted-foreground">📝</div>
                <p className="mt-2 text-lg font-medium">No active tasks</p>
                <p className="text-sm text-muted-foreground">
                  Add a new task to get started
                </p>
                <Button onClick={() => setIsCreateDialogOpen(true)} className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Task
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingTasks.map((task: any) => (
                  <Card key={task.id} className={`${isOverdue(task) ? "border-red-500" : ""}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={task.status === "completed"}
                              onChange={() => handleToggleTaskStatus(task.id, task.status)}
                              className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <h3 className={`font-medium ${task.status === "completed" ? "line-through text-muted-foreground" : ""}`}>
                              {task.title}
                            </h3>
                          </div>
                          {task.description && (
                            <p className="text-sm text-muted-foreground mt-1 ml-7">
                              {task.description}
                            </p>
                          )}
                          <div className="flex items-center space-x-2 mt-2 ml-7">
                            <div className="flex items-center text-sm">
                              <Calendar className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                              <span className={`${isOverdue(task) ? "text-red-500 font-medium" : "text-muted-foreground"}`}>
                                {formatDate(task.due_date)}
                                {isOverdue(task) && " (Overdue)"}
                              </span>
                            </div>
                            <div>{getPriorityBadge(task.priority)}</div>
                            {task.tag && <div>{getTagBadge(task.tag)}</div>}
                          </div>
                        </div>
                        <div className="flex space-x-1 ml-4">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => openEditDialog(task)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDeleteTask(task.id, task.title)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed">
            {completedTasks.length === 0 ? (
              <div className="text-center py-10 border rounded-lg">
                <div className="mx-auto h-10 w-10 text-muted-foreground">✓</div>
                <p className="mt-2 text-lg font-medium">No completed tasks</p>
                <p className="text-sm text-muted-foreground">
                  Complete a task to see it here
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {completedTasks.map((task: any) => (
                  <Card key={task.id} className="bg-muted/40">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={task.status === "completed"}
                              onChange={() => handleToggleTaskStatus(task.id, task.status)}
                              className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <h3 className="font-medium line-through text-muted-foreground">
                              {task.title}
                            </h3>
                          </div>
                          {task.description && (
                            <p className="text-sm text-muted-foreground mt-1 ml-7 line-through">
                              {task.description}
                            </p>
                          )}
                          <div className="flex items-center space-x-2 mt-2 ml-7">
                            {task.completed_at && (
                              <div className="flex items-center text-sm text-muted-foreground">
                                <Clock className="h-3.5 w-3.5 mr-1" />
                                <span>
                                  Completed: {formatDate(task.completed_at)}
                                </span>
                              </div>
                            )}
                            {task.tag && <div>{getTagBadge(task.tag)}</div>}
                          </div>
                        </div>
                        <div>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDeleteTask(task.id, task.title)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
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

export default TodoList;
