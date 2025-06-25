import { useState, useRef, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import KeyboardShortcuts from "@/components/keyboard-shortcuts";
import BulkActions from "@/components/bulk-actions";
import WritingStyleVisualization from "@/components/writing-style-visualization";
import { 
  Upload, 
  FileText, 
  Trash2, 
  Plus, 
  Download,
  FileCheck,
  Calendar,
  Tag,
  Search,
  Filter,
  SortAsc,
  Eye,
  AlertCircle,
  CheckCircle2,
  BarChart3,
  Target
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
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "name" | "size">("date");
  const [filterBy, setFilterBy] = useState<"all" | "analyzed" | "unanalyzed">("all");
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showAnalysis, setShowAnalysis] = useState(false);
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

  const handleFiles = useCallback(async (files: File[]) => {
    const supportedTypes = ["text/plain", ".txt", ".doc", ".docx"];
    
    for (const file of files) {
      const fileId = Math.random().toString(36).substr(2, 9);
      
      if (file.type === "text/plain" || file.name.endsWith(".txt")) {
        setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));
        
        try {
          // Simulate upload progress for better UX
          const progressInterval = setInterval(() => {
            setUploadProgress(prev => {
              const current = prev[fileId] || 0;
              if (current >= 90) {
                clearInterval(progressInterval);
                return prev;
              }
              return { ...prev, [fileId]: current + 10 };
            });
          }, 100);

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
          
          await uploadMutation.mutateAsync(sampleData);
          setUploadProgress(prev => ({ ...prev, [fileId]: 100 }));
          
          setTimeout(() => {
            setUploadProgress(prev => {
              const newProgress = { ...prev };
              delete newProgress[fileId];
              return newProgress;
            });
          }, 1000);
          
        } catch (error) {
          setUploadProgress(prev => {
            const newProgress = { ...prev };
            delete newProgress[fileId];
            return newProgress;
          });
        }
      } else {
        toast({
          title: "Unsupported file type",
          description: `Please upload .txt files only. "${file.name}" is not supported.`,
          variant: "destructive",
        });
      }
    }
  }, [uploadMutation, toast]);

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

  const filteredAndSortedSamples = writingSamples
    ?.filter(sample => {
      const matchesSearch = sample.originalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          sample.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          sample.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesFilter = filterBy === "all" || 
                          (filterBy === "analyzed" && sample.isAnalyzed) ||
                          (filterBy === "unanalyzed" && !sample.isAnalyzed);
      
      return matchesSearch && matchesFilter;
    })
    ?.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.originalName.localeCompare(b.originalName);
        case "size":
          return b.fileSize - a.fileSize;
        case "date":
        default:
          return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
      }
    });

  const handleBulkDelete = useCallback(async (ids: string[]) => {
    await Promise.all(ids.map(id => 
      apiRequest(`/api/writing-samples/${id}`, { method: 'DELETE' })
    ));
    queryClient.invalidateQueries({ queryKey: ['/api/writing-samples'] });
  }, [queryClient]);

  const handleBulkDownload = useCallback(async (ids: string[]) => {
    const selectedSamples = writingSamples?.filter(sample => ids.includes(sample.id));
    if (!selectedSamples) return;

    const content = selectedSamples.map(sample => 
      `Title: ${sample.originalName}\nUploaded: ${new Date(sample.uploadedAt).toLocaleDateString()}\n\n${sample.content}\n\n---\n\n`
    ).join('');
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `writing-samples-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [writingSamples]);

  // Mock writing analysis data - in real app this would come from AI analysis
  const mockAnalysis = {
    complexity: 7.2,
    vocabulary: 8.1,
    clarity: 6.8,
    engagement: 7.5,
    authenticity: 8.9,
    persuasiveness: 6.4,
  };

  const mockStrengths = [
    "Authentic and personal voice that draws readers in",
    "Strong use of concrete examples and anecdotes",
    "Varied sentence structure keeps writing engaging",
    "Natural flow and logical progression of ideas"
  ];

  const mockRecommendations = [
    "Work on making complex ideas more accessible to readers",
    "Strengthen concluding paragraphs with more impactful endings",
    "Use more persuasive language when making arguments",
    "Consider adding transitional phrases for smoother flow"
  ];

  return (
    <div className="max-w-6xl mx-auto p-6">
      <KeyboardShortcuts 
        onNewSample={() => setShowAddDialog(true)}
        onSearch={() => {
          const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
          searchInput?.focus();
        }}
      />
      <div className="flex flex-col space-y-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Writing Repository
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Upload your past work to help AI understand your writing style and voice
            </p>
          </div>

          <div className="flex gap-3">
            {writingSamples && writingSamples.length >= 3 && (
              <Button 
                variant="outline" 
                onClick={() => setShowAnalysis(!showAnalysis)}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                {showAnalysis ? "Hide" : "Show"} Style Analysis
              </Button>
            )}
            
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

        {/* Search and Filter Controls */}
        {writingSamples && writingSamples.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-3 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search writing samples..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex gap-2">
                <select
                  value={filterBy}
                  onChange={(e) => setFilterBy(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Samples</option>
                  <option value="analyzed">Analyzed</option>
                  <option value="unanalyzed">Not Analyzed</option>
                </select>
                
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="date">Sort by Date</option>
                  <option value="name">Sort by Name</option>
                  <option value="size">Sort by Size</option>
                </select>
              </div>
            </div>
            
            <div className="text-sm text-gray-500">
              {filteredAndSortedSamples?.length || 0} of {writingSamples?.length || 0} samples
            </div>
          </div>
        )}

        {/* Bulk Actions */}
        {writingSamples && writingSamples.length > 0 && (
          <BulkActions
            items={filteredAndSortedSamples || []}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            onDelete={handleBulkDelete}
            onDownload={handleBulkDownload}
          />
        )}
      </div>

      {/* Writing Style Analysis */}
      {showAnalysis && writingSamples && writingSamples.length >= 3 && (
        <div className="mb-8">
          <WritingStyleVisualization
            analysis={mockAnalysis}
            sampleCount={writingSamples.length}
            strengths={mockStrengths}
            recommendations={mockRecommendations}
          />
        </div>
      )}

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
            
            {/* Upload Progress */}
            {Object.keys(uploadProgress).length > 0 && (
              <div className="mt-4 space-y-2">
                {Object.entries(uploadProgress).map(([fileId, progress]) => (
                  <div key={fileId} className="flex items-center space-x-3">
                    <div className="flex-1">
                      <Progress value={progress} className="h-2" />
                    </div>
                    <span className="text-sm text-gray-500 min-w-12">{progress}%</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Writing Samples Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-5/6" />
                  <Skeleton className="h-3 w-4/6" />
                  <div className="flex gap-2">
                    <Skeleton className="h-5 w-12" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : !filteredAndSortedSamples || filteredAndSortedSamples.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium mb-2">
              {writingSamples?.length === 0 ? "No writing samples yet" : "No samples match your search"}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {writingSamples?.length === 0 
                ? "Upload your past essays and writing to help AI understand your unique style"
                : "Try adjusting your search terms or filters to find samples"
              }
            </p>
            <Button onClick={() => fileInputRef.current?.click()}>
              Upload Your First Sample
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedSamples?.map((sample) => (
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
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(sample.content);
                        toast({
                          title: "Copied to clipboard",
                          description: "Writing sample content copied",
                        });
                      }}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteMutation.mutate(sample.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
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

                  <div className="flex items-center justify-between">
                    {sample.isAnalyzed ? (
                      <Badge variant="default" className="text-xs">
                        <CheckCircle2 className="w-2 h-2 mr-1" />
                        Style Analyzed
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs">
                        <AlertCircle className="w-2 h-2 mr-1" />
                        Pending Analysis
                      </Badge>
                    )}
                    
                    <div className="text-xs text-gray-400">
                      {sample.content.split(' ').length} words
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}