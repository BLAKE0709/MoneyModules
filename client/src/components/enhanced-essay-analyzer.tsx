import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  PenTool, 
  Brain, 
  Target, 
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  User,
  Lightbulb,
  RefreshCw
} from "lucide-react";

interface EssayAnalyzerProps {
  initialContent?: string;
  essayType?: string;
  onAnalysisComplete?: (analysis: any) => void;
}

export default function EnhancedEssayAnalyzer({ 
  initialContent = "", 
  essayType = "personal_statement",
  onAnalysisComplete 
}: EssayAnalyzerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [essayContent, setEssayContent] = useState(initialContent);
  const [activeTab, setActiveTab] = useState("write");
  const [analysis, setAnalysis] = useState<any>(null);
  const [suggestions, setSuggestions] = useState<any[]>([]);

  const analyzeEssay = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('/api/agents/essay/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          essayContent,
          essayType
        }),
      });
      return response;
    },
    onSuccess: (data) => {
      if (data.success) {
        setAnalysis(data.data.analysis);
        setSuggestions(data.suggestions || []);
        setActiveTab("analysis");
        onAnalysisComplete?.(data.data);
        
        toast({
          title: "Essay Analysis Complete",
          description: "Your essay has been analyzed with your personal writing style in mind",
        });
      }
    },
    onError: () => {
      toast({
        title: "Analysis Failed",
        description: "Unable to analyze essay. Please try again.",
        variant: "destructive",
      });
    },
  });

  const improveEssay = useMutation({
    mutationFn: async (focusAreas: string[]) => {
      const response = await apiRequest('/api/agents/essay/improve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          essayContent,
          focusAreas
        }),
      });
      return response;
    },
    onSuccess: (data) => {
      if (data.success && data.data.improvedVersion) {
        setEssayContent(data.data.improvedVersion);
        setActiveTab("write");
        
        toast({
          title: "Essay Improved",
          description: `Voice preservation score: ${data.data.voicePreservationScore}/10`,
        });
      }
    },
  });

  const generatePrompts = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('/api/agents/essay/prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ essayType }),
      });
      return response;
    },
    onSuccess: (data) => {
      if (data.success) {
        setActiveTab("prompts");
        toast({
          title: "Personalized Prompts Generated",
          description: `${data.data.length} prompts tailored to your profile`,
        });
      }
    },
  });

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-600";
    if (score >= 6) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 8) return "Excellent";
    if (score >= 6) return "Good";
    return "Needs Work";
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            AI Essay Polish Pro
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Voice-preserving essay analysis and improvement
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => generatePrompts.mutate()}
            disabled={generatePrompts.isPending}
          >
            <Lightbulb className="w-4 h-4 mr-2" />
            Get Prompts
          </Button>
          <Button
            onClick={() => analyzeEssay.mutate()}
            disabled={analyzeEssay.isPending || !essayContent.trim()}
          >
            <Brain className="w-4 h-4 mr-2" />
            {analyzeEssay.isPending ? "Analyzing..." : "Analyze Essay"}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="write">Write</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
          <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
          <TabsTrigger value="prompts">Prompts</TabsTrigger>
        </TabsList>

        <TabsContent value="write" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Essay Content</CardTitle>
              <CardDescription>
                Write or paste your essay here for AI-powered analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="essay-content">Essay Text</Label>
                  <Textarea
                    id="essay-content"
                    value={essayContent}
                    onChange={(e) => setEssayContent(e.target.value)}
                    placeholder="Paste your essay here or start writing..."
                    className="min-h-96 mt-2"
                  />
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Words: {essayContent.split(/\s+/).filter(word => word.length > 0).length}</span>
                  <span>Characters: {essayContent.length}</span>
                </div>

                {analysis && (
                  <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="w-4 h-4" />
                      <span className="font-medium">Voice Consistency Score</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={analysis.voiceConsistencyScore * 10} className="flex-1" />
                      <span className="font-medium">{analysis.voiceConsistencyScore}/10</span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-300 mt-2">
                      How well this essay matches your authentic writing style
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          {analysis ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Essay Scores
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { label: "Clarity", value: analysis.clarityScore },
                      { label: "Impact", value: analysis.impactScore },
                      { label: "Originality", value: analysis.originalityScore },
                      { label: "Voice Consistency", value: analysis.voiceConsistencyScore },
                      { label: "Authenticity", value: analysis.authenticityScore }
                    ].map(({ label, value }) => (
                      <div key={label} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{label}</span>
                        <div className="flex items-center gap-2">
                          <Progress value={value * 10} className="w-20" />
                          <span className={`text-sm font-medium ${getScoreColor(value)}`}>
                            {value}/10
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {getScoreLabel(value)}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Essay Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-sm mb-2">Strengths</h4>
                      <ul className="space-y-1">
                        {analysis.strengths?.map((strength: string, index: number) => (
                          <li key={index} className="flex items-start gap-2 text-sm">
                            <CheckCircle2 className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                            <span>{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-medium text-sm mb-2">Voice-Preserving Improvements</h4>
                      <ul className="space-y-1">
                        {analysis.voicePreservingImprovements?.map((improvement: string, index: number) => (
                          <li key={index} className="flex items-start gap-2 text-sm">
                            <AlertCircle className="w-3 h-3 text-blue-500 mt-0.5 flex-shrink-0" />
                            <span>{improvement}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                      <div>
                        <span className="text-xs text-gray-500">Word Count</span>
                        <p className="font-medium">{analysis.wordCount}</p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500">Emotional Impact</span>
                        <p className="font-medium">{analysis.emotionalImpact}/10</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Brain className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium mb-2">No Analysis Yet</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Write your essay and click "Analyze Essay" to see detailed insights
                </p>
                <Button
                  onClick={() => setActiveTab("write")}
                  variant="outline"
                >
                  Start Writing
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="suggestions" className="space-y-6">
          {suggestions.length > 0 ? (
            <div className="space-y-4">
              {suggestions.map((suggestion, index) => (
                <Card key={suggestion.id || index}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{suggestion.title}</CardTitle>
                      <Badge variant={
                        suggestion.priority === 'high' ? 'destructive' :
                        suggestion.priority === 'medium' ? 'default' : 'secondary'
                      }>
                        {suggestion.priority} priority
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                      {suggestion.description}
                    </p>
                    
                    {suggestion.beforeExample && suggestion.afterExample && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div>
                          <h5 className="font-medium text-sm mb-2">Before</h5>
                          <div className="p-3 bg-red-50 dark:bg-red-950 rounded border">
                            <p className="text-sm">{suggestion.beforeExample}</p>
                          </div>
                        </div>
                        <div>
                          <h5 className="font-medium text-sm mb-2">After (In Your Voice)</h5>
                          <div className="p-3 bg-green-50 dark:bg-green-950 rounded border">
                            <p className="text-sm">{suggestion.afterExample}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        Impact: {suggestion.estimatedImpact}
                      </span>
                      {suggestion.actionable && (
                        <Button
                          size="sm"
                          onClick={() => improveEssay.mutate([suggestion.title])}
                          disabled={improveEssay.isPending}
                        >
                          <RefreshCw className="w-3 h-3 mr-1" />
                          Apply Suggestion
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <PenTool className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium mb-2">No Suggestions Yet</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Analyze your essay first to get personalized improvement suggestions
                </p>
                <Button
                  onClick={() => analyzeEssay.mutate()}
                  disabled={analyzeEssay.isPending || !essayContent.trim()}
                >
                  Analyze Essay
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="prompts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personalized Essay Prompts</CardTitle>
              <CardDescription>
                Prompts tailored to your interests, experiences, and goals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => generatePrompts.mutate()}
                disabled={generatePrompts.isPending}
                className="w-full"
              >
                <Lightbulb className="w-4 h-4 mr-2" />
                {generatePrompts.isPending ? "Generating..." : "Generate Personalized Prompts"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}