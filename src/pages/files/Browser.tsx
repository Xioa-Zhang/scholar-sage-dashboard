
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, Plus, Trash, FileIcon, FolderIcon } from "lucide-react";
import { useFiles, createFile, deleteFile, useSubjects } from "@/lib/database";

const Browser = () => {
  const { files, loading } = useFiles();
  const { subjects } = useSubjects();
  const { toast } = useToast();
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [fileName, setFileName] = useState("");
  const [subjectId, setSubjectId] = useState<number | undefined>(undefined);
  const [filePath, setFilePath] = useState("");
  const [fileType, setFileType] = useState("");
  const [fileSize, setFileSize] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [viewMode, setViewMode] = useState("grid");
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setFileName(file.name);
      setFileType(file.type);
      setFileSize(file.size);
      
      // For demo purposes, we'll use a fake path
      setFilePath(`local://files/${file.name}`);
    }
  };

  const handleUploadFile = () => {
    if (!selectedFile) {
      toast({
        title: "Error",
        description: "Please select a file to upload",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // In a real app, you would upload the file to a server or local storage
      // Here, we just store the metadata in the database
      createFile(fileName, filePath, fileType, fileSize, subjectId);
      
      setIsUploadDialogOpen(false);
      setSelectedFile(null);
      setFileName("");
      setFilePath("");
      setFileType("");
      setFileSize(0);
      setSubjectId(undefined);
      
      toast({
        title: "Success",
        description: `File "${fileName}" uploaded successfully`,
      });
      
      // Reload the page to refresh the files list
      window.location.reload();
    } catch (error) {
      console.error("Error uploading file:", error);
      toast({
        title: "Error",
        description: "Failed to upload file",
        variant: "destructive",
      });
    }
  };

  const handleDeleteFile = (id: number, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        deleteFile(id);
        
        toast({
          title: "Success",
          description: `File "${name}" deleted successfully`,
        });
        
        // Reload the page to refresh the files list
        window.location.reload();
      } catch (error) {
        console.error("Error deleting file:", error);
        toast({
          title: "Error",
          description: "Failed to delete file",
          variant: "destructive",
        });
      }
    }
  };

  const handleViewFile = (file: any) => {
    // In a real app, you would read the file from storage
    // Here, we just simulate viewing text files
    if (file.type.startsWith("text/") || file.type === "application/pdf") {
      setFileContent(`This is a preview of ${file.name}.\n\nIn a real application, the actual content of the file would be displayed here.`);
      setIsViewDialogOpen(true);
    } else {
      toast({
        title: "Info",
        description: "This file type cannot be previewed",
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return "🖼️";
    if (type.startsWith("video/")) return "🎬";
    if (type.startsWith("audio/")) return "🎵";
    if (type === "application/pdf") return "📄";
    if (type.includes("word")) return "📝";
    if (type.includes("excel") || type.includes("spreadsheet")) return "📊";
    if (type.includes("powerpoint") || type.includes("presentation")) return "📑";
    if (type.startsWith("text/")) return "📋";
    return "📁";
  };

  return (
    <div className="container mx-auto p-4 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Files</h1>
        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Upload File
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload File</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="file">Select File</Label>
                <Input
                  id="file"
                  type="file"
                  onChange={handleFileChange}
                />
              </div>
              {selectedFile && (
                <div className="text-sm text-muted-foreground">
                  File Size: {formatFileSize(selectedFile.size)}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="subject">Subject (Optional)</Label>
                <Select 
                  value={subjectId?.toString() || ""} 
                  onValueChange={(value) => setSubjectId(value ? Number(value) : undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {subjects.map((subject: any) => (
                      <SelectItem key={subject.id} value={subject.id.toString()}>
                        {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleUploadFile}>Upload</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>File Preview</DialogTitle>
            </DialogHeader>
            <div className="max-h-[60vh] overflow-auto">
              <pre className="p-4 bg-muted rounded-md text-sm whitespace-pre-wrap">
                {fileContent}
              </pre>
            </div>
            <DialogFooter>
              <Button onClick={() => setIsViewDialogOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-center py-10">
          <div className="inline-block animate-pulse h-6 w-6 rounded-full bg-primary"></div>
          <p className="mt-2">Loading files...</p>
        </div>
      ) : (
        <Tabs value={viewMode} onValueChange={setViewMode}>
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="grid">Grid</TabsTrigger>
              <TabsTrigger value="list">List</TabsTrigger>
            </TabsList>
            <div className="text-sm text-muted-foreground">
              {files.length} {files.length === 1 ? "file" : "files"}
            </div>
          </div>

          <TabsContent value="grid">
            {files.length === 0 ? (
              <div className="text-center py-10 border rounded-lg">
                <FileText className="mx-auto h-10 w-10 text-muted-foreground" />
                <p className="mt-2 text-lg font-medium">No files found</p>
                <p className="text-sm text-muted-foreground">
                  Upload files to get started
                </p>
                <Button onClick={() => setIsUploadDialogOpen(true)} className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Upload File
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {files.map((file: any) => (
                  <Card key={file.id} className="overflow-hidden">
                    <CardContent className="pt-6 px-4 pb-2 flex flex-col items-center">
                      <div className="text-4xl mb-2">{getFileIcon(file.type)}</div>
                      <div className="font-medium text-center truncate w-full">
                        {file.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatFileSize(file.size)}
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-center p-2">
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleViewFile(file)}>
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteFile(file.id, file.name)}
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
            {files.length === 0 ? (
              <div className="text-center py-10 border rounded-lg">
                <FileText className="mx-auto h-10 w-10 text-muted-foreground" />
                <p className="mt-2 text-lg font-medium">No files found</p>
                <p className="text-sm text-muted-foreground">
                  Upload files to get started
                </p>
                <Button onClick={() => setIsUploadDialogOpen(true)} className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Upload File
                </Button>
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12"></TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead className="w-20">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {files.map((file: any) => (
                      <TableRow key={file.id}>
                        <TableCell>
                          <div className="text-2xl">{getFileIcon(file.type)}</div>
                        </TableCell>
                        <TableCell className="font-medium">{file.name}</TableCell>
                        <TableCell>{file.type}</TableCell>
                        <TableCell>{formatFileSize(file.size)}</TableCell>
                        <TableCell>{file.subject_name || "-"}</TableCell>
                        <TableCell>
                          <div className="flex space-x-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleViewFile(file)}
                              title="View"
                            >
                              <FileText className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleDeleteFile(file.id, file.name)}
                              title="Delete"
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default Browser;
