
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { FileText, FolderIcon, RefreshCw } from "lucide-react";

const Sync = () => {
  const { toast } = useToast();
  const [folders, setFolders] = useState([
    { id: 1, name: "Documents", path: "C:/Users/Student/Documents", enabled: true },
    { id: 2, name: "Downloads", path: "C:/Users/Student/Downloads", enabled: false },
    { id: 3, name: "Desktop", path: "C:/Users/Student/Desktop", enabled: false },
  ]);
  const [newFolderPath, setNewFolderPath] = useState("");
  const [newFolderName, setNewFolderName] = useState("");
  const [syncing, setSyncing] = useState(false);
  
  const handleAddFolder = () => {
    if (!newFolderPath) {
      toast({
        title: "Error",
        description: "Please enter a folder path",
        variant: "destructive",
      });
      return;
    }
    
    const name = newFolderName || newFolderPath.split("/").pop() || newFolderPath.split("\\").pop() || "New Folder";
    
    const newFolder = {
      id: Date.now(),
      name,
      path: newFolderPath,
      enabled: true,
    };
    
    setFolders([...folders, newFolder]);
    setNewFolderPath("");
    setNewFolderName("");
    
    toast({
      title: "Success",
      description: `Folder "${name}" added successfully`,
    });
  };

  const handleRemoveFolder = (id: number) => {
    setFolders(folders.filter((folder) => folder.id !== id));
    
    toast({
      title: "Success",
      description: "Folder removed successfully",
    });
  };

  const handleToggleFolderSync = (id: number) => {
    setFolders(
      folders.map((folder) =>
        folder.id === id ? { ...folder, enabled: !folder.enabled } : folder
      )
    );
  };

  const handleSyncNow = () => {
    setSyncing(true);
    
    toast({
      title: "Syncing...",
      description: "Synchronizing your folders",
    });
    
    // Simulate sync process
    setTimeout(() => {
      setSyncing(false);
      
      toast({
        title: "Success",
        description: "All folders synchronized successfully",
      });
    }, 2000);
  };

  return (
    <div className="container mx-auto p-4 animate-fade-in">
      <h1 className="text-2xl font-bold mb-6">Sync Settings</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Folder Synchronization</CardTitle>
              <CardDescription>
                Add local folders to sync with your dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {folders.map((folder) => (
                  <div
                    key={folder.id}
                    className="flex items-center justify-between border-b pb-3"
                  >
                    <div className="flex items-center">
                      <FolderIcon className="h-5 w-5 text-muted-foreground mr-2" />
                      <div>
                        <div className="font-medium">{folder.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {folder.path}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id={`folder-${folder.id}`}
                          checked={folder.enabled}
                          onCheckedChange={() => handleToggleFolderSync(folder.id)}
                        />
                        <Label htmlFor={`folder-${folder.id}`} className="sr-only">
                          Enable sync
                        </Label>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveFolder(folder.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}

                <div className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <Label htmlFor="folder-name">Folder Name (Optional)</Label>
                    <Input
                      id="folder-name"
                      placeholder="My Documents"
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="folder-path">Folder Path</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="folder-path"
                        placeholder="C:\Users\Username\Documents"
                        value={newFolderPath}
                        onChange={(e) => setNewFolderPath(e.target.value)}
                      />
                      <Button onClick={handleAddFolder}>Add</Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Sync Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Last Synchronized</span>
                    <span className="text-sm text-muted-foreground">Today, 10:30 AM</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Active Folders</span>
                    <span className="text-sm text-muted-foreground">
                      {folders.filter((f) => f.enabled).length} / {folders.length}
                    </span>
                  </div>
                </div>
                <Button 
                  className="w-full" 
                  onClick={handleSyncNow}
                  disabled={syncing}
                >
                  <RefreshCw className={`mr-2 h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
                  {syncing ? "Syncing..." : "Sync Now"}
                </Button>
                <div className="text-xs text-muted-foreground text-center">
                  Auto-sync is enabled and runs every 30 minutes
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Sync Options</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="auto-sync">Auto Synchronize</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically sync at regular intervals
                    </p>
                  </div>
                  <Switch id="auto-sync" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="notification">Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Show notifications when sync completes
                    </p>
                  </div>
                  <Switch id="notification" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="index-content">Index Content</Label>
                    <p className="text-sm text-muted-foreground">
                      Make file contents searchable
                    </p>
                  </div>
                  <Switch id="index-content" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Sync;
