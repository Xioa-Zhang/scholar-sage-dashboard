
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Plus, Edit, Trash, BarChart } from "lucide-react";

// Mock data for progress tracking
const initialProjects = [
  {
    id: 1,
    name: "Final Year Project",
    description: "AI-powered health monitoring system",
    progress: 65,
    tasks: [
      { id: 1, name: "Research phase", completed: true },
      { id: 2, name: "Design architecture", completed: true },
      { id: 3, name: "Implement core features", completed: true },
      { id: 4, name: "Testing", completed: false },
      { id: 5, name: "Documentation", completed: false },
    ],
    startDate: "2023-09-01",
    endDate: "2024-05-30",
  },
  {
    id: 2,
    name: "Web Development Course",
    description: "Learning React and building portfolio",
    progress: 80,
    tasks: [
      { id: 1, name: "HTML & CSS", completed: true },
      { id: 2, name: "JavaScript", completed: true },
      { id: 3, name: "React basics", completed: true },
      { id: 4, name: "Advanced React", completed: false },
      { id: 5, name: "Final project", completed: false },
    ],
    startDate: "2023-10-15",
    endDate: "2024-03-15",
  },
];

const ProgressTracker = () => {
  const [projects, setProjects] = useState(initialProjects);
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [taskName, setTaskName] = useState("");
  const [currentProgress, setCurrentProgress] = useState(0);
  
  const handleCreateProject = () => {
    if (!name) {
      toast({
        title: "Error",
        description: "Project name is required",
        variant: "destructive",
      });
      return;
    }
    
    const newProject = {
      id: Date.now(),
      name,
      description,
      progress: 0,
      tasks: [],
      startDate,
      endDate,
    };
    
    setProjects([...projects, newProject]);
    setIsCreateDialogOpen(false);
    resetForm();
    
    toast({
      title: "Success",
      description: `Project "${name}" created successfully`,
    });
  };

  const handleEditProject = () => {
    if (!name || !editId) {
      toast({
        title: "Error",
        description: "Project name is required",
        variant: "destructive",
      });
      return;
    }
    
    setProjects(
      projects.map((project) =>
        project.id === editId
          ? { ...project, name, description, startDate, endDate }
          : project
      )
    );
    
    setIsEditDialogOpen(false);
    resetForm();
    
    toast({
      title: "Success",
      description: `Project "${name}" updated successfully`,
    });
  };

  const handleDeleteProject = (id: number, projectName: string) => {
    if (confirm(`Are you sure you want to delete "${projectName}"?`)) {
      setProjects(projects.filter((project) => project.id !== id));
      
      toast({
        title: "Success",
        description: `Project "${projectName}" deleted successfully`,
      });
    }
  };

  const handleAddTask = () => {
    if (!taskName || !selectedProject) {
      toast({
        title: "Error",
        description: "Task name is required",
        variant: "destructive",
      });
      return;
    }
    
    const updatedProjects = projects.map((project) => {
      if (project.id === selectedProject.id) {
        const newTask = {
          id: Date.now(),
          name: taskName,
          completed: false,
        };
        
        return {
          ...project,
          tasks: [...project.tasks, newTask],
        };
      }
      return project;
    });
    
    setProjects(updatedProjects);
    setTaskName("");
    
    toast({
      title: "Success",
      description: `Task added to "${selectedProject.name}"`,
    });
  };

  const handleToggleTask = (projectId: number, taskId: number) => {
    const updatedProjects = projects.map((project) => {
      if (project.id === projectId) {
        const updatedTasks = project.tasks.map((task) =>
          task.id === taskId ? { ...task, completed: !task.completed } : task
        );
        
        // Calculate new progress
        const completedTasks = updatedTasks.filter((task) => task.completed).length;
        const progress = updatedTasks.length > 0 ? Math.round((completedTasks / updatedTasks.length) * 100) : 0;
        
        return {
          ...project,
          tasks: updatedTasks,
          progress,
        };
      }
      return project;
    });
    
    setProjects(updatedProjects);
  };

  const handleDeleteTask = (projectId: number, taskId: number) => {
    const updatedProjects = projects.map((project) => {
      if (project.id === projectId) {
        const updatedTasks = project.tasks.filter((task) => task.id !== taskId);
        
        // Calculate new progress
        const completedTasks = updatedTasks.filter((task) => task.completed).length;
        const progress = updatedTasks.length > 0 ? Math.round((completedTasks / updatedTasks.length) * 100) : 0;
        
        return {
          ...project,
          tasks: updatedTasks,
          progress,
        };
      }
      return project;
    });
    
    setProjects(updatedProjects);
    
    toast({
      title: "Success",
      description: "Task deleted successfully",
    });
  };

  const handleUpdateProgress = (projectId: number) => {
    const updatedProjects = projects.map((project) => 
      project.id === projectId ? { ...project, progress: currentProgress } : project
    );
    
    setProjects(updatedProjects);
    
    toast({
      title: "Success",
      description: `Progress updated to ${currentProgress}%`,
    });
  };

  const openEditDialog = (project: any) => {
    setEditId(project.id);
    setName(project.name);
    setDescription(project.description || "");
    setStartDate(project.startDate || "");
    setEndDate(project.endDate || "");
    setIsEditDialogOpen(true);
  };

  const openTaskDialog = (project: any) => {
    setSelectedProject(project);
    setCurrentProgress(project.progress);
    setIsTaskDialogOpen(true);
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setStartDate("");
    setEndDate("");
    setEditId(null);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  const calculateTimeRemaining = (endDate: string) => {
    if (!endDate) return "";
    
    const end = new Date(endDate);
    const now = new Date();
    
    if (end < now) return "Overdue";
    
    const diffTime = Math.abs(end.getTime() - now.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return `${diffDays} days remaining`;
  };

  return (
    <div className="container mx-auto p-4 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Progress Tracker</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Project
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Project Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Project name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Project description"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start-date">Start Date (Optional)</Label>
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
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreateProject}>Create Project</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Project</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Project Name</Label>
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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-start-date">Start Date (Optional)</Label>
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
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleEditProject}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {selectedProject?.name} - Tasks
              </DialogTitle>
            </DialogHeader>
            {selectedProject && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-center mb-1">
                    <Label>Current Progress: {selectedProject.progress}%</Label>
                    <span className="text-sm">{currentProgress}%</span>
                  </div>
                  <Slider
                    value={[currentProgress]}
                    min={0}
                    max={100}
                    step={5}
                    onValueChange={(values) => setCurrentProgress(values[0])}
                    className="mb-4"
                  />
                  <Button onClick={() => handleUpdateProgress(selectedProject.id)}>
                    Update Progress
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <Label>Tasks</Label>
                  <div className="space-y-2">
                    {selectedProject.tasks.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No tasks created for this project yet
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {selectedProject.tasks.map((task: any) => (
                          <div
                            key={task.id}
                            className="flex items-center justify-between border-b pb-2"
                          >
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                checked={task.completed}
                                onChange={() => handleToggleTask(selectedProject.id, task.id)}
                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary mr-2"
                              />
                              <span className={task.completed ? "line-through text-muted-foreground" : ""}>
                                {task.name}
                              </span>
                            </div>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleDeleteTask(selectedProject.id, task.id)}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Add Task</Label>
                  <div className="flex space-x-2">
                    <Input
                      value={taskName}
                      onChange={(e) => setTaskName(e.target.value)}
                      placeholder="New task"
                    />
                    <Button onClick={handleAddTask}>Add</Button>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button onClick={() => setIsTaskDialogOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-10 border rounded-lg">
          <BarChart className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-2 text-lg font-medium">No projects found</p>
          <p className="text-sm text-muted-foreground">
            Create a new project to track your progress
          </p>
          <Button onClick={() => setIsCreateDialogOpen(true)} className="mt-4">
            <Plus className="h-4 w-4 mr-2" />
            Add Project
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((project) => (
            <Card key={project.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{project.name}</CardTitle>
                    <CardDescription>{project.description}</CardDescription>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => openEditDialog(project)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDeleteProject(project.id, project.name)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span className="font-medium">{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} />
                  </div>
                  
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <div>
                      {project.startDate && (
                        <div>Start: {formatDate(project.startDate)}</div>
                      )}
                    </div>
                    <div className="text-right">
                      {project.endDate && (
                        <>
                          <div>Due: {formatDate(project.endDate)}</div>
                          <div className={`text-xs ${
                            calculateTimeRemaining(project.endDate) === "Overdue" 
                              ? "text-red-500" 
                              : ""
                          }`}>
                            {calculateTimeRemaining(project.endDate)}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium mb-1">
                      Tasks: {project.tasks.filter((t) => t.completed).length}/{project.tasks.length}
                    </div>
                    <div className="text-sm">
                      {project.tasks.length > 0 ? (
                        <ul className="space-y-1">
                          {project.tasks.slice(0, 3).map((task) => (
                            <li key={task.id} className="flex items-center">
                              <span className={`w-2 h-2 rounded-full mr-2 ${
                                task.completed ? "bg-green-500" : "bg-muted"
                              }`}></span>
                              <span className={task.completed ? "line-through text-muted-foreground" : ""}>
                                {task.name}
                              </span>
                            </li>
                          ))}
                          {project.tasks.length > 3 && (
                            <li className="text-xs text-muted-foreground">
                              +{project.tasks.length - 3} more tasks
                            </li>
                          )}
                        </ul>
                      ) : (
                        <span className="text-muted-foreground">No tasks added yet</span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={() => openTaskDialog(project)}>
                  Manage Tasks & Progress
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProgressTracker;
