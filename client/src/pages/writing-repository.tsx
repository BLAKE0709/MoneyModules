import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Upload, 
  FileText, 
  Trash2, 
  Plus, 
  Download,
  FileCheck,
  Calendar,
  Tag
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { WritingSample } from "@shared/schema";

export default function WritingRepository() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newSample, setNewSample] = useState({
    originalName: "",
    content: "",
    notes: "",
    tags: ""
  });

  const { data: writingSamples, isLoading } = useQuery<WritingSample[]>({
    queryKey: ["/api/writing-samples"]
  });

  const uploadMutation = useMutation({
    mutationFn: async (sampleData: any) => {
      return await apiRequest("/api/writing-samples", {
        method: "POST",
        body: JSON.stringify(sampleData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/writing-samples"] });
      toast({
        title: "Success",
        description: "Writing sample uploaded successfully",
      });
      setShowAddDialog(false);
      setNewSample({ originalName: "", content: "", notes: "", tags: "" });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to upload writing sample",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/writing-samples/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/writing-samples"] });
      toast({
        title: "Success",
        description: "Writing sample deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete writing sample",
        variant: "destructive",
      });
    },
  });

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFiles(files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      handleFiles(files);
    }
  };

  const handleFiles = async (files: File[]) => {
    for (const file of files) {
      if (file.type === "text/plain" || file.name.endsWith(".txt")) {
        const content = await file.text();
        const sampleData = {
          filename: file.name,
          originalName: file.name,
          content,
          fileType: "txt",
          fileSize: file.size,
          tags: [],
          notes: "",
        };
        uploadMutation.mutate(sampleData);
      } else {
        toast({
          title: "Unsupported file type",
          description: "Please upload .txt files only",
          variant: "destructive",
        });
      }
    }
  };

  const handleManualAdd = () => {
    if (!newSample.originalName || !newSample.content) {
      toast({
        title: "Missing information",
        description: "Please provide both a title and content",
        variant: "destructive",
      });
      return;
    }

    const sampleData = {
      filename: newSample.originalName.toLowerCase().replace(/\s+/g, "-") + ".txt",
      originalName: newSample.originalName,
      content: newSample.content,
      fileType: "txt",
      fileSize: new Blob([newSample.content]).size,
      tags: newSample.tags ? newSample.tags.split(",").map(tag => tag.trim()) : [],
      notes: newSample.notes,
    };

    uploadMutation.mutate(sampleData);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Writing Repository
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Upload your past work to help AI understand your writing style and voice
          </p>
        </div>

        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Writing Sample
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Writing Sample</DialogTitle>
              <DialogDescription>
                Manually add a writing sample by typing or pasting content
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newSample.originalName}
                  onChange={(e) => setNewSample({ ...newSample, originalName: e.target.value })}
                  placeholder="e.g., College Application Essay"
                />
              </div>
              <div>
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={newSample.content}
                  onChange={(e) => setNewSample({ ...newSample, content: e.target.value })}
                  placeholder="Paste your writing sample here..."
                  className="min-h-48"
                />
              </div>
              <div>
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  value={newSample.tags}
                  onChange={(e) => setNewSample({ ...newSample, tags: e.target.value })}
                  placeholder="e.g., essay, creative writing, personal statement"
                />
              </div>
              <div>
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea
                  id="notes"
                  value={newSample.notes}
                  onChange={(e) => setNewSample({ ...newSample, notes: e.target.value })}
                  placeholder="Any additional notes about this writing sample..."
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleManualAdd} disabled={uploadMutation.isPending}>
                  {uploadMutation.isPending ? "Adding..." : "Add Sample"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Upload Area */}
      <Card className="mb-8">
        <CardContent className="p-8">
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                : "border-gray-300 dark:border-gray-600"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium mb-2">Upload Writing Samples</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Drag and drop your .txt files here, or click to browse
            </p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".txt"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              disabled={uploadMutation.isPending}
            >
              {uploadMutation.isPending ? "Uploading..." : "Choose Files"}
            </Button>
            <p className="text-sm text-gray-500 mt-2">
              Supported formats: .txt files only
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Writing Samples Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : writingSamples?.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium mb-2">No writing samples yet</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Upload your past essays and writing to help AI understand your unique style
            </p>
            <Button onClick={() => fileInputRef.current?.click()}>
              Upload Your First Sample
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {writingSamples?.map((sample) => (
            <Card key={sample.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-2">
                      {sample.originalName}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-2">
                      <Calendar className="w-3 h-3" />
                      {formatDate(sample.uploadedAt)}
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteMutation.mutate(sample.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
                    {sample.content.substring(0, 150)}...
                  </p>
                  
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <FileCheck className="w-3 h-3" />
                    {sample.fileType.toUpperCase()}
                    <span>•</span>
                    {formatFileSize(sample.fileSize)}
                  </div>

                  {sample.tags && sample.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {sample.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          <Tag className="w-2 h-2 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                      {sample.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{sample.tags.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}

                  {sample.notes && (
                    <p className="text-xs text-gray-500 italic line-clamp-2">
                      {sample.notes}
                    </p>
                  )}

                  {sample.isAnalyzed && (
                    <Badge variant="default" className="text-xs">
                      <FileCheck className="w-2 h-2 mr-1" />
                      Style Analyzed
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}