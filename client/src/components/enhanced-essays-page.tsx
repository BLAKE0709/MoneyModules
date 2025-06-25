import { useState, useCallback, useEffect } from "react";
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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import EnhancedEssayCard from "@/components/enhanced-essay-card";
import KeyboardShortcuts from "@/components/keyboard-shortcuts";
import AutoSaveIndicator from "@/components/auto-save-indicator";
import BulkActions from "@/components/bulk-actions";
import AchievementSystem from "@/components/achievement-system";
import { 
  FileText, 
  Plus, 
  TrendingUp, 
  Star,
  Clock,
  Target,
  Edit,
  Trash2,
  Eye,
  Lightbulb,
  CheckCircle,
  Search,
  Filter,
  SortAsc,
  Download,
  Share,
  BookOpen,
  Trophy,
  PenTool
} from "lucide-react";
import type { Essay, AiSuggestion, EssayVersion } from "@shared/schema";

export default function EnhancedEssaysPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [selectedEssay, setSelectedEssay] = useState<Essay | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "title" | "score">("date");
  const [filterBy, setFilterBy] = useState<"all" | "analyzed" | "draft">("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | undefined>();
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [newEssay, setNewEssay] = useState({
    title: "",
    prompt: "",
    content: "",
    essayType: "",
    wordLimit: "",
  });

  const { data: essays, isLoading } = useQuery({
    queryKey: ['/api/essays'],
  });

  const { data: suggestions } = useQuery({
    queryKey: ['/api/essays', selectedEssay?.id, 'suggestions'],
    enabled: !!selectedEssay?.id,
  });

  const createMutation = useMutation({
    mutationFn: async (essayData: any) => {
      const response = await apiRequest('/api/essays', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(essayData),
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/essays'] });
      setShowNewDialog(false);
      setNewEssay({ title: "", prompt: "", content: "", essayType: "", wordLimit: "" });
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
      toast({
        title: "Essay created successfully",
        description: "Your essay has been saved and is ready for polishing",
        action: (
          <Button variant="outline" size="sm" onClick={() => setShowDetailsDialog(true)}>
            View Essay
          </Button>
        ),
      });
    },
    onError: () => {
      toast({
        title: "Failed to create essay",
        description: "Please check your connection and try again",
        variant: "destructive",
      });
    },
  });

  const analyzeMutation = useMutation({
    mutationFn: async (essayId: string) => {
      const response = await apiRequest(`/api/essays/${essayId}/analyze`, {
        method: 'POST',
      });
      return response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/essays'] });
      const { analysis } = data;
      const overallScore = Math.round((analysis.clarityScore + analysis.impactScore + analysis.originalityScore) / 3);
      
      toast({
        title: `Analysis complete - Score: ${overallScore}/10`,
        description: `Found ${analysis.suggestions?.length || 0} improvement suggestions`,
        action: (
          <Button variant="outline" size="sm" onClick={() => setShowDetailsDialog(true)}>
            View Results
          </Button>
        ),
      });
    },
    onError: () => {
      toast({
        title: "Analysis failed",
        description: "AI analysis is temporarily unavailable. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Auto-save functionality
  const autoSaveMutation = useMutation({
    mutationFn: async (essayData: any) => {
      setIsAutoSaving(true);
      const response = await apiRequest('/api/essays/auto-save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(essayData),
      });
      return response;
    },
    onSuccess: () => {
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
      setIsAutoSaving(false);
    },
    onError: () => {
      setIsAutoSaving(false);
    },
  });

  // Auto-save on content change
  useEffect(() => {
    if (hasUnsavedChanges && newEssay.content.length > 50) {
      const timer = setTimeout(() => {
        autoSaveMutation.mutate({
          ...newEssay,
          isDraft: true,
        });
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [newEssay, hasUnsavedChanges]);

  const handleContentChange = useCallback((field: string, value: string) => {
    setNewEssay(prev => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      ...newEssay,
      wordLimit: newEssay.wordLimit ? parseInt(newEssay.wordLimit) : undefined,
    });
  };

  // Filter and sort essays
  const filteredAndSortedEssays = essays
    ?.filter(essay => {
      const matchesSearch = essay.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          essay.prompt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          essay.content.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = filterBy === "all" || 
                          (filterBy === "analyzed" && essay.status === "analyzed") ||
                          (filterBy === "draft" && essay.status !== "analyzed");
      
      return matchesSearch && matchesFilter;
    })
    ?.sort((a, b) => {
      switch (sortBy) {
        case "title":
          return a.title.localeCompare(b.title);
        case "score":
          const scoreA = a.clarityScore && a.impactScore && a.originalityScore 
            ? (a.clarityScore + a.impactScore + a.originalityScore) / 3 
            : 0;
          const scoreB = b.clarityScore && b.impactScore && b.originalityScore 
            ? (b.clarityScore + b.impactScore + b.originalityScore) / 3 
            : 0;
          return scoreB - scoreA;
        case "date":
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

  const handleBulkDelete = useCallback(async (ids: string[]) => {
    await Promise.all(ids.map(id => 
      apiRequest(`/api/essays/${id}`, { method: 'DELETE' })
    ));
    queryClient.invalidateQueries({ queryKey: ['/api/essays'] });
  }, [queryClient]);

  const handleBulkDownload = useCallback(async (ids: string[]) => {
    const selectedEssays = essays?.filter(essay => ids.includes(essay.id));
    if (!selectedEssays) return;

    const content = selectedEssays.map(essay => 
      `Title: ${essay.title}\nPrompt: ${essay.prompt}\n\n${essay.content}\n\n---\n\n`
    ).join('');
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `essays-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [essays]);

  // Mock achievement data
  const mockAchievements = [
    {
      id: "1",
      title: "First Essay",
      description: "Create your first essay",
      icon: PenTool,
      progress: essays?.length || 0,
      maxProgress: 1,
      unlocked: (essays?.length || 0) >= 1,
      category: "writing" as const,
      points: 50,
    },
    {
      id: "2", 
      title: "Essay Analyzer",
      description: "Analyze 5 essays with AI",
      icon: Target,
      progress: essays?.filter(e => e.status === "analyzed").length || 0,
      maxProgress: 5,
      unlocked: (essays?.filter(e => e.status === "analyzed").length || 0) >= 5,
      category: "analysis" as const,
      points: 100,
    },
    {
      id: "3",
      title: "High Scorer",
      description: "Get an overall score of 8+ on any essay",
      icon: Star,
      progress: essays?.filter(e => {
        const score = e.clarityScore && e.impactScore && e.originalityScore 
          ? (e.clarityScore + e.impactScore + e.originalityScore) / 3 
          : 0;
        return score >= 8;
      }).length || 0,
      maxProgress: 1,
      unlocked: essays?.some(e => {
        const score = e.clarityScore && e.impactScore && e.originalityScore 
          ? (e.clarityScore + e.impactScore + e.originalityScore) / 3 
          : 0;
        return score >= 8;
      }) || false,
      category: "improvement" as const,
      points: 200,
    },
  ];

  const totalPoints = mockAchievements.filter(a => a.unlocked).reduce((sum, a) => sum + a.points, 0);
  const level = Math.floor(totalPoints / 100) + 1;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <KeyboardShortcuts 
        onNewEssay={() => setShowNewDialog(true)}
        onSearch={() => {
          const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
          searchInput?.focus();
        }}
      />

      <div className="flex flex-col space-y-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Essay Polish
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Write, analyze, and perfect your essays with AI assistance
            </p>
          </div>

          <div className="flex items-center gap-3">
            <AutoSaveIndicator 
              isLoading={isAutoSaving}
              lastSaved={lastSaved}
              hasUnsavedChanges={hasUnsavedChanges}
            />
            
            <Button 
              variant="outline" 
              onClick={() => setShowAchievements(!showAchievements)}
            >
              <Trophy className="w-4 h-4 mr-2" />
              Achievements
            </Button>
            
            <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  New Essay
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Essay</DialogTitle>
                  <DialogDescription>
                    Start writing your essay and get AI-powered feedback
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="title">Essay Title</Label>
                    <Input
                      id="title"
                      value={newEssay.title}
                      onChange={(e) => handleContentChange('title', e.target.value)}
                      placeholder="Enter essay title"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="prompt">Essay Prompt</Label>
                    <Textarea
                      id="prompt"
                      value={newEssay.prompt}
                      onChange={(e) => handleContentChange('prompt', e.target.value)}
                      placeholder="Paste the essay prompt here"
                      className="min-h-20"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="content">Essay Content</Label>
                    <Textarea
                      id="content"
                      value={newEssay.content}
                      onChange={(e) => handleContentChange('content', e.target.value)}
                      placeholder="Write your essay here..."
                      className="min-h-40"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="essayType">Essay Type</Label>
                      <Select value={newEssay.essayType} onValueChange={(value) => handleContentChange('essayType', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select essay type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="personal-statement">Personal Statement</SelectItem>
                          <SelectItem value="supplemental">Supplemental Essay</SelectItem>
                          <SelectItem value="scholarship">Scholarship Essay</SelectItem>
                          <SelectItem value="admission">Admission Essay</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="wordLimit">Word Limit (Optional)</Label>
                      <Input
                        id="wordLimit"
                        type="number"
                        value={newEssay.wordLimit}
                        onChange={(e) => handleContentChange('wordLimit', e.target.value)}
                        placeholder="e.g., 650"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={() => setShowNewDialog(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createMutation.isPending}>
                      {createMutation.isPending ? "Creating..." : "Create Essay"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Search and Filter Controls */}
        {essays && essays.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-3 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search essays..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex gap-2">
                <Select value={filterBy} onValueChange={(value: any) => setFilterBy(value)}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Essays</SelectItem>
                    <SelectItem value="analyzed">Analyzed</SelectItem>
                    <SelectItem value="draft">Drafts</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Sort by Date</SelectItem>
                    <SelectItem value="title">Sort by Title</SelectItem>
                    <SelectItem value="score">Sort by Score</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="text-sm text-gray-500">
              {filteredAndSortedEssays?.length || 0} of {essays?.length || 0} essays
            </div>
          </div>
        )}

        {/* Bulk Actions */}
        {essays && essays.length > 0 && (
          <BulkActions
            items={filteredAndSortedEssays || []}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            onDelete={handleBulkDelete}
            onDownload={handleBulkDownload}
          />
        )}
      </div>

      {/* Achievement System */}
      {showAchievements && (
        <div className="mb-8">
          <AchievementSystem
            totalPoints={totalPoints}
            level={level}
            nextLevelPoints={100}
            achievements={mockAchievements}
          />
        </div>
      )}

      {/* Essays Grid */}
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
                    <Skeleton className="h-1 w-full" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : !filteredAndSortedEssays || filteredAndSortedEssays.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium mb-2">
              {essays?.length === 0 ? "No essays yet" : "No essays match your search"}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {essays?.length === 0 
                ? "Create your first essay to get started with AI-powered analysis"
                : "Try adjusting your search terms or filters to find essays"
              }
            </p>
            <Button onClick={() => setShowNewDialog(true)}>
              Create Your First Essay
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedEssays?.map((essay) => (
            <EnhancedEssayCard
              key={essay.id}
              essay={essay}
              suggestions={suggestions}
              onView={(id) => {
                setSelectedEssay(essay);
                setShowDetailsDialog(true);
              }}
              onEdit={(id) => {
                toast({
                  title: "Edit Essay",
                  description: "Edit functionality coming soon!",
                });
              }}
              onAnalyze={(id) => analyzeMutation.mutate(id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}