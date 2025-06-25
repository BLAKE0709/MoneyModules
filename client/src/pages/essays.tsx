import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { Essay, AiSuggestion, EssayVersion } from "@shared/schema";

export default function Essays() {
  const [selectedEssayId, setSelectedEssayId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const { data: essays, isLoading: essaysLoading } = useQuery({
    queryKey: ["/api/essays"],
  });

  const { data: selectedEssay, isLoading: essayLoading } = useQuery({
    queryKey: ["/api/essays", selectedEssayId],
    enabled: !!selectedEssayId,
  });

  const { data: suggestions, isLoading: suggestionsLoading } = useQuery({
    queryKey: ["/api/essays", selectedEssayId, "suggestions"],
    enabled: !!selectedEssayId,
  });

  const { data: versions, isLoading: versionsLoading } = useQuery({
    queryKey: ["/api/essays", selectedEssayId, "versions"],
    enabled: !!selectedEssayId,
  });

  const createEssayMutation = useMutation({
    mutationFn: async (essayData: any) => {
      const response = await apiRequest("POST", "/api/essays", essayData);
      return response.json();
    },
    onSuccess: (newEssay) => {
      queryClient.invalidateQueries({ queryKey: ["/api/essays"] });
      setSelectedEssayId(newEssay.id);
      setIsCreating(false);
      toast({
        title: "Essay Created",
        description: "Your essay has been created successfully.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to create essay. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateEssayMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await apiRequest("PUT", `/api/essays/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/essays"] });
      queryClient.invalidateQueries({ queryKey: ["/api/essays", selectedEssayId] });
      toast({
        title: "Essay Updated",
        description: "Your essay has been saved.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update essay. Please try again.",
        variant: "destructive",
      });
    },
  });

  const analyzeEssayMutation = useMutation({
    mutationFn: async (essayId: string) => {
      const response = await apiRequest("POST", `/api/essays/${essayId}/analyze`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/essays", selectedEssayId] });
      queryClient.invalidateQueries({ queryKey: ["/api/essays", selectedEssayId, "suggestions"] });
      toast({
        title: "Analysis Complete",
        description: "AI analysis has been completed for your essay.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to analyze essay. Please try again.",
        variant: "destructive",
      });
    },
  });

  const applySuggestionMutation = useMutation({
    mutationFn: async ({ essayId, suggestionId }: { essayId: string; suggestionId: string }) => {
      const response = await apiRequest("POST", `/api/essays/${essayId}/suggestions/${suggestionId}/apply`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/essays", selectedEssayId] });
      queryClient.invalidateQueries({ queryKey: ["/api/essays", selectedEssayId, "suggestions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/essays", selectedEssayId, "versions"] });
      toast({
        title: "Suggestion Applied",
        description: "The AI suggestion has been applied to your essay.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to apply suggestion. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleCreateEssay = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const essayData = {
      title: formData.get("title") as string,
      type: formData.get("type") as string,
      content: formData.get("content") as string,
      wordLimit: parseInt(formData.get("wordLimit") as string) || null,
      wordCount: (formData.get("content") as string).split(/\s+/).length,
    };
    createEssayMutation.mutate(essayData);
  };

  const handleUpdateEssay = (field: string, value: any) => {
    if (!selectedEssayId) return;
    
    const updateData: any = { [field]: value };
    if (field === "content") {
      updateData.wordCount = value.split(/\s+/).length;
    }
    
    updateEssayMutation.mutate({ id: selectedEssayId, data: updateData });
  };

  const handleExport = (format: string) => {
    if (!selectedEssay) return;
    
    if (format === "copy") {
      navigator.clipboard.writeText(selectedEssay.content);
      toast({
        title: "Copied",
        description: "Essay content copied to clipboard.",
      });
    } else {
      toast({
        title: "Export",
        description: `Export as ${format.toUpperCase()} functionality coming soon.`,
      });
    }
  };

  if (essaysLoading) {
    return (
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2">
          <Skeleton className="h-96 w-full" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  if (isCreating) {
    return (
      <Card className="shadow-material">
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold text-neutral-800 mb-6">Create New Essay</h2>
          <form onSubmit={handleCreateEssay} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="title">Essay Title</Label>
                <Input 
                  id="title" 
                  name="title" 
                  placeholder="Enter essay title" 
                  required 
                />
              </div>
              <div>
                <Label htmlFor="type">Type</Label>
                <Select name="type" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select essay type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="personal_statement">Personal Statement</SelectItem>
                    <SelectItem value="scholarship">Scholarship Essay</SelectItem>
                    <SelectItem value="college_application">College Application</SelectItem>
                    <SelectItem value="research_proposal">Research Proposal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="wordLimit">Word Limit</Label>
                <Input 
                  id="wordLimit" 
                  name="wordLimit" 
                  type="number" 
                  placeholder="500" 
                />
              </div>
            </div>

            <div>
              <Label htmlFor="content">Essay Content</Label>
              <Textarea 
                id="content"
                name="content"
                className="h-96"
                placeholder="Start writing your essay here..."
                required
              />
            </div>

            <div className="flex justify-end space-x-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsCreating(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createEssayMutation.isPending}
                className="bg-primary hover:bg-blue-700"
              >
                {createEssayMutation.isPending ? "Creating..." : "Create Essay"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }

  if (!selectedEssayId && essays?.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-12 h-12 text-neutral-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-neutral-800 mb-2">No Essays Yet</h3>
        <p className="text-neutral-600 mb-6">Create your first essay to get started with voice-preserving AI analysis from EssayPolish Pro</p>
        <div className="flex gap-4">
          <Button 
            onClick={() => setIsCreating(true)}
            className="bg-primary hover:bg-blue-700"
          >
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z"/>
            </svg>
            Create New Essay
          </Button>
          <Button 
            asChild
            variant="outline"
            className="border-blue-200 text-blue-700 hover:bg-blue-50"
          >
            <a href="/agents">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12,2A2,2 0 0,1 14,2C14,3.11 13.1,4 12,4C10.9,4 10,3.11 10,2A2,2 0 0,1 12,2M21,9V7L15,1H5A2,2 0 0,0 3,3V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V9M12,7L17,12L12,17V14H8V10H12V7Z"/>
              </svg>
              Try EssayPolish Pro
            </a>
          </Button>
        </div>
      </div>
    );
  }

  if (!selectedEssayId && essays?.length > 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-neutral-800">Your Essays</h2>
          </div>
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12,2A2,2 0 0,1 14,2C14,3.11 13.1,4 12,4C10.9,4 10,3.11 10,2A2,2 0 0,1 12,2M21,9V7L15,1H5A2,2 0 0,0 3,3V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V9M12,7L17,12L12,17V14H8V10H12V7Z"/>
            </svg>
            EssayPolish Pro Active
          </div>
        </div>
        <Button 
            onClick={() => setIsCreating(true)}
            className="bg-primary hover:bg-blue-700"
          >
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z"/>
            </svg>
            New Essay
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {essays.map((essay: Essay) => (
            <Card 
              key={essay.id} 
              className="shadow-material cursor-pointer hover:shadow-material-lg transition-shadow"
              onClick={() => setSelectedEssayId(essay.id)}
            >
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-neutral-800 truncate">{essay.title}</h3>
                  <Badge variant="secondary" className="text-xs">
                    {essay.type.replace('_', ' ')}
                  </Badge>
                </div>
                <p className="text-sm text-neutral-600 line-clamp-3 mb-4">
                  {essay.content.substring(0, 150)}...
                </p>
                <div className="flex justify-between items-center text-xs text-neutral-500">
                  <span>{essay.wordCount} words</span>
                  <span>{new Date(essay.updatedAt!).toLocaleDateString()}</span>
                </div>
                {(essay.clarityScore || essay.impactScore || essay.originalityScore) && (
                  <div className="flex space-x-2 mt-3">
                    {essay.clarityScore && (
                      <div className="text-xs bg-primary text-white px-2 py-1 rounded-full">
                        Clarity: {parseFloat(essay.clarityScore).toFixed(1)}
                      </div>
                    )}
                    {essay.impactScore && (
                      <div className="text-xs bg-secondary text-white px-2 py-1 rounded-full">
                        Impact: {parseFloat(essay.impactScore).toFixed(1)}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
      {/* Essay Editor */}
      <div className="xl:col-span-2 bg-white rounded-xl shadow-material p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setSelectedEssayId(null)}
            >
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20,11V13H8L13.5,18.5L12.08,19.92L4.16,12L12.08,4.08L13.5,5.5L8,11H20Z"/>
              </svg>
              Back
            </Button>
            <h2 className="text-2xl font-bold text-neutral-800">Essay Polish Studio</h2>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-sm text-neutral-600">
              Auto-save: <span className="text-success">On</span>
            </span>
            <Button 
              onClick={() => selectedEssayId && analyzeEssayMutation.mutate(selectedEssayId)}
              disabled={analyzeEssayMutation.isPending}
              className="bg-primary text-white hover:bg-blue-700"
            >
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 3L1 9v6c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V9l-11-6z"/>
              </svg>
              {analyzeEssayMutation.isPending ? "Analyzing..." : "Polish with AI"}
            </Button>
          </div>
        </div>

        {essayLoading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-96 w-full" />
          </div>
        ) : selectedEssay ? (
          <>
            {/* Essay Metadata */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <Label>Essay Title</Label>
                <Input 
                  value={selectedEssay.title}
                  onChange={(e) => handleUpdateEssay("title", e.target.value)}
                  placeholder="Enter essay title"
                />
              </div>
              <div>
                <Label>Type</Label>
                <Select 
                  value={selectedEssay.type}
                  onValueChange={(value) => handleUpdateEssay("type", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="personal_statement">Personal Statement</SelectItem>
                    <SelectItem value="scholarship">Scholarship Essay</SelectItem>
                    <SelectItem value="college_application">College Application</SelectItem>
                    <SelectItem value="research_proposal">Research Proposal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Word Limit</Label>
                <Input 
                  type="number"
                  value={selectedEssay.wordLimit || ""}
                  onChange={(e) => handleUpdateEssay("wordLimit", parseInt(e.target.value) || null)}
                  placeholder="500"
                />
              </div>
            </div>

            {/* Essay Content */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <Label>Essay Content</Label>
                <div className="text-sm text-neutral-600">
                  <span>{selectedEssay.wordCount || 0}</span>
                  {selectedEssay.wordLimit && <span> / {selectedEssay.wordLimit}</span>} words
                </div>
              </div>
              <Textarea 
                value={selectedEssay.content}
                onChange={(e) => handleUpdateEssay("content", e.target.value)}
                className="h-96 font-source"
                placeholder="Start writing your essay here..."
              />
            </div>

            {/* AI Feedback Panel */}
            {(selectedEssay.clarityScore || selectedEssay.impactScore || selectedEssay.originalityScore) && (
              <div className="bg-gradient-primary text-white rounded-lg p-4 mb-6">
                <div className="flex items-center mb-3">
                  <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 3L1 9v6c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V9l-11-6z"/>
                  </svg>
                  <h3 className="font-semibold">AI Analysis Complete</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  {selectedEssay.clarityScore && (
                    <div className="bg-white bg-opacity-20 rounded-lg p-3">
                      <div className="font-semibold mb-1">Clarity Score</div>
                      <div className="text-2xl font-bold">
                        {parseFloat(selectedEssay.clarityScore).toFixed(1)}/10
                      </div>
                    </div>
                  )}
                  {selectedEssay.impactScore && (
                    <div className="bg-white bg-opacity-20 rounded-lg p-3">
                      <div className="font-semibold mb-1">Impact Score</div>
                      <div className="text-2xl font-bold">
                        {parseFloat(selectedEssay.impactScore).toFixed(1)}/10
                      </div>
                    </div>
                  )}
                  {selectedEssay.originalityScore && (
                    <div className="bg-white bg-opacity-20 rounded-lg p-3">
                      <div className="font-semibold mb-1">Originality</div>
                      <div className="text-2xl font-bold">
                        {parseFloat(selectedEssay.originalityScore).toFixed(1)}/10
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        ) : null}
      </div>

      {/* AI Suggestions Sidebar */}
      <div className="space-y-6">
        {/* Suggestions Panel */}
        <Card className="shadow-material">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-neutral-800 mb-4 flex items-center">
              <svg className="w-5 h-5 text-accent mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9,21C5.12,20.55 2,17.59 2,14A8,8 0 0,1 10,6C11.31,6 12.54,6.35 13.62,6.95L12.21,8.36C11.55,8.13 10.81,8 10,8A6,6 0 0,0 4,14C4,16.22 5.21,18.15 7.03,19.29L12,14.34L15,17.34L13,19.34L9,21M17,2L22,7L20.5,8.5L19,7V10.5C19,12.43 17.43,14 15.5,14H14.83L16.83,16H15.5C12.46,16 10,13.54 10,10.5V10H12V10.5A2.5,2.5 0 0,0 14.5,13H15.5A1.5,1.5 0 0,0 17,11.5V7L15.5,8.5L17,2Z"/>
              </svg>
              AI Suggestions
            </h3>
            {suggestionsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            ) : suggestions?.length > 0 ? (
              <div className="space-y-4">
                {suggestions.map((suggestion: AiSuggestion) => (
                  <div 
                    key={suggestion.id}
                    className={`border border-neutral-200 rounded-lg p-4 hover:bg-neutral-50 transition-colors ${
                      suggestion.applied ? "opacity-50" : "cursor-pointer"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-sm font-medium text-primary capitalize">
                        {suggestion.type.replace('_', ' ')}
                      </span>
                      <Badge 
                        variant={suggestion.impact === 'high' ? 'default' : suggestion.impact === 'medium' ? 'secondary' : 'outline'}
                        className="text-xs"
                      >
                        {suggestion.impact === 'high' ? 'High Impact' : suggestion.impact === 'medium' ? 'Medium' : 'Low Impact'}
                      </Badge>
                    </div>
                    <p className="text-sm text-neutral-600 mb-2">{suggestion.suggestion}</p>
                    {!suggestion.applied ? (
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => selectedEssayId && applySuggestionMutation.mutate({ 
                          essayId: selectedEssayId, 
                          suggestionId: suggestion.id 
                        })}
                        disabled={applySuggestionMutation.isPending}
                        className="text-xs text-primary hover:underline p-0 h-auto"
                      >
                        {applySuggestionMutation.isPending ? "Applying..." : "Apply Suggestion"}
                      </Button>
                    ) : (
                      <span className="text-xs text-success">Applied</span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-neutral-500">
                <svg className="w-8 h-8 mx-auto mb-2 opacity-50" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9,21C5.12,20.55 2,17.59 2,14A8,8 0 0,1 10,6C11.31,6 12.54,6.35 13.62,6.95L12.21,8.36C11.55,8.13 10.81,8 10,8A6,6 0 0,0 4,14C4,16.22 5.21,18.15 7.03,19.29L12,14.34L15,17.34L13,19.34L9,21M17,2L22,7L20.5,8.5L19,7V10.5C19,12.43 17.43,14 15.5,14H14.83L16.83,16H15.5C12.46,16 10,13.54 10,10.5V10H12V10.5A2.5,2.5 0 0,0 14.5,13H15.5A1.5,1.5 0 0,0 17,11.5V7L15.5,8.5L17,2Z"/>
                </svg>
                <p className="text-sm">No suggestions yet</p>
                <p className="text-xs">Run AI analysis to get suggestions</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Essay History */}
        <Card className="shadow-material">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-neutral-800 mb-4 flex items-center">
              <svg className="w-5 h-5 text-neutral-600 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13.5,8H12V13L16.28,15.54L17,14.33L13.5,12.25V8M13,3A9,9 0 0,0 4,12H1L4.96,16.03L9,12H6A7,7 0 0,1 13,5A7,7 0 0,1 20,12A7,7 0 0,1 13,19C11.07,19 9.32,18.21 8.06,16.94L6.64,18.36C8.27,20 10.5,21 13,21A9,9 0 0,0 22,12A9,9 0 0,0 13,3"/>
              </svg>
              Version History
            </h3>
            {versionsLoading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : versions?.length > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border border-neutral-200 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-neutral-800">Current Version</p>
                    <p className="text-xs text-neutral-500">
                      {selectedEssay ? new Date(selectedEssay.updatedAt!).toLocaleString() : ""}
                    </p>
                  </div>
                  <Badge variant="default" className="text-xs">Current</Badge>
                </div>
                {versions.map((version: EssayVersion) => (
                  <div key={version.id} className="flex items-center justify-between p-3 border border-neutral-200 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-neutral-800">Version {version.versionNumber}</p>
                      <p className="text-xs text-neutral-500">
                        {new Date(version.createdAt!).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button 
                        size="sm" 
                        variant="ghost"
                        className="text-primary hover:text-blue-700 p-1"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z"/>
                        </svg>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-neutral-500">
                <p className="text-sm">No version history</p>
                <p className="text-xs">Apply AI suggestions to create versions</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Export Options */}
        <Card className="shadow-material">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-neutral-800 mb-4">Export Essay</h3>
            <div className="space-y-3">
              <Button 
                variant="outline"
                className="w-full justify-center"
                onClick={() => handleExport("pdf")}
              >
                <svg className="w-4 h-4 text-error mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                </svg>
                <span className="font-medium">Export as PDF</span>
              </Button>
              <Button 
                variant="outline"
                className="w-full justify-center"
                onClick={() => handleExport("word")}
              >
                <svg className="w-4 h-4 text-primary mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                </svg>
                <span className="font-medium">Export as Word Doc</span>
              </Button>
              <Button 
                variant="outline"
                className="w-full justify-center"
                onClick={() => handleExport("copy")}
              >
                <svg className="w-4 h-4 text-secondary mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z"/>
                </svg>
                <span className="font-medium">Copy to Clipboard</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
