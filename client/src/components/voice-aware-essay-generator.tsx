import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Brain, 
  FileText, 
  User, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2,
  Upload,
  Lightbulb 
} from "lucide-react";

interface VoiceAnalysis {
  vocabularyLevel: string;
  sentenceComplexity: string;
  tonality: string;
  personalityMarkers: string[];
  commonPhrases: string[];
  writingPatterns: {
    voiceConfidence: number;
  };
}

export default function VoiceAwareEssayGenerator() {
  const [prompt, setPrompt] = useState("");
  const [essayType, setEssayType] = useState("");
  const [keyPoints, setKeyPoints] = useState("");
  const [generatedDraft, setGeneratedDraft] = useState("");
  const { toast } = useToast();

  // Get user's voice analysis
  const { data: voiceData, isLoading: voiceLoading } = useQuery({
    queryKey: ['/api/writing-voice/analysis'],
  });

  // Generate voice-aware essay draft
  const generateDraftMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/essays/generate-draft", data);
      return response.json();
    },
    onSuccess: (data) => {
      setGeneratedDraft(data.draftContent);
      toast({
        title: "Draft Generated",
        description: `Created in your authentic voice (${data.voiceConfidence}% confidence)`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Generation Failed",
        description: error.message.includes("writing samples") 
          ? "Upload some of your previous writing first"
          : "Failed to generate draft",
        variant: "destructive",
      });
    },
  });

  const handleGenerateDraft = () => {
    if (!prompt || !essayType) {
      toast({
        title: "Missing Information",
        description: "Please provide both a prompt and essay type",
        variant: "destructive",
      });
      return;
    }

    const keyPointsArray = keyPoints 
      ? keyPoints.split(',').map(point => point.trim()).filter(Boolean)
      : [];

    generateDraftMutation.mutate({
      prompt,
      essayType,
      keyPoints: keyPointsArray
    });
  };

  const getVoiceConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return "text-green-600";
    if (confidence >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getVoiceConfidenceLabel = (confidence: number) => {
    if (confidence >= 80) return "Strong Voice Profile";
    if (confidence >= 60) return "Good Voice Profile";
    return "Needs More Samples";
  };

  if (voiceLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <Brain className="w-8 h-8 mx-auto text-blue-600 animate-pulse mb-2" />
            <p>Analyzing your writing voice...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Voice Profile Status */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            Your Writing Voice Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          {voiceData?.hasVoiceProfile ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Voice Confidence</span>
                <div className="flex items-center gap-2">
                  <span className={`font-bold ${getVoiceConfidenceColor(voiceData.voiceAnalysis.writingPatterns.voiceConfidence)}`}>
                    {voiceData.voiceAnalysis.writingPatterns.voiceConfidence}%
                  </span>
                  <Badge className={
                    voiceData.voiceAnalysis.writingPatterns.voiceConfidence >= 70 
                      ? "bg-green-100 text-green-800" 
                      : "bg-yellow-100 text-yellow-800"
                  }>
                    {getVoiceConfidenceLabel(voiceData.voiceAnalysis.writingPatterns.voiceConfidence)}
                  </Badge>
                </div>
              </div>
              
              <Progress 
                value={voiceData.voiceAnalysis.writingPatterns.voiceConfidence} 
                className="h-2"
              />
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Style:</span>
                  <span className="ml-2 capitalize">{voiceData.voiceAnalysis.tonality}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Vocabulary:</span>
                  <span className="ml-2 capitalize">{voiceData.voiceAnalysis.vocabularyLevel}</span>
                </div>
              </div>
              
              {voiceData.voiceAnalysis.personalityMarkers.length > 0 && (
                <div>
                  <span className="text-sm font-medium text-gray-700">Your Voice Markers:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {voiceData.voiceAnalysis.personalityMarkers.slice(0, 3).map((marker: string, idx: number) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {marker}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              <p className="text-xs text-gray-600">
                Based on {voiceData.samplesAnalyzed} writing samples
              </p>
            </div>
          ) : (
            <div className="text-center py-4">
              <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
              <p className="text-gray-600 mb-2">No voice profile found</p>
              <p className="text-sm text-gray-500 mb-4">
                Upload some of your previous writing to create a voice profile for authentic essay generation
              </p>
              <Button variant="outline" size="sm" onClick={() => window.location.href = "/writing-repository"}>
                <Upload className="w-4 h-4 mr-2" />
                Upload Writing Samples
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Essay Generator */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            Voice-Aware Essay Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="essayType">Essay Type</Label>
            <Select value={essayType} onValueChange={setEssayType}>
              <SelectTrigger>
                <SelectValue placeholder="Select essay type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="personal_statement">Personal Statement</SelectItem>
                <SelectItem value="supplemental">Supplemental Essay</SelectItem>
                <SelectItem value="scholarship">Scholarship Essay</SelectItem>
                <SelectItem value="why_major">Why Major Essay</SelectItem>
                <SelectItem value="activity">Activity Essay</SelectItem>
                <SelectItem value="challenge">Challenge Essay</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="prompt">Essay Prompt</Label>
            <Textarea
              id="prompt"
              placeholder="Paste the full essay prompt here..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
            />
          </div>

          <div>
            <Label htmlFor="keyPoints">Key Points to Include (Optional)</Label>
            <Input
              id="keyPoints"
              placeholder="Leadership experience, volunteering, academic achievements..."
              value={keyPoints}
              onChange={(e) => setKeyPoints(e.target.value)}
            />
            <p className="text-xs text-gray-500 mt-1">
              Separate multiple points with commas
            </p>
          </div>

          <Button 
            onClick={handleGenerateDraft}
            disabled={!voiceData?.hasVoiceProfile || generateDraftMutation.isPending}
            className="w-full"
          >
            {generateDraftMutation.isPending ? (
              <>
                <Brain className="w-4 h-4 mr-2 animate-pulse" />
                Generating in Your Voice...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Voice-Aware Draft
              </>
            )}
          </Button>

          {!voiceData?.hasVoiceProfile && (
            <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-yellow-800">Voice Profile Required</p>
                <p className="text-yellow-700">
                  Upload writing samples to generate essays in your authentic voice
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Generated Draft */}
      {generatedDraft && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              Generated Draft (In Your Voice)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={generatedDraft}
              onChange={(e) => setGeneratedDraft(e.target.value)}
              rows={12}
              className="mb-4"
            />
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <FileText className="w-4 h-4 mr-2" />
                Save as New Essay
              </Button>
              <Button variant="outline" size="sm">
                <Lightbulb className="w-4 h-4 mr-2" />
                Analyze & Improve
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}