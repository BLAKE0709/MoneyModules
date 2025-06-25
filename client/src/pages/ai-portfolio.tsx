import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Upload, Download, Bot, TrendingUp, Award, Target, FileText, Zap, CheckCircle2 } from "lucide-react";

interface AIUsageLedger {
  userId: string;
  totalInteractions: number;
  skillCategories: AIUsageInsight[];
  professionalReadiness: {
    score: number;
    strengths: string[];
    recommendations: string[];
  };
  portfolioHighlights: {
    bestExamples: string[];
    uniqueApproaches: string[];
    problemSolvingEvidence: string[];
  };
  generatedAt: string;
}

interface AIUsageInsight {
  skillCategory: string;
  proficiencyLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  evidenceCount: number;
  keyCapabilities: string[];
  businessValue: string;
  portfolioSummary: string;
}

export default function AIPortfolio() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importData, setImportData] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: portfolio, isLoading } = useQuery({
    queryKey: [`/api/ai-usage/portfolio/${user?.id}`],
    enabled: !!user?.id,
  });

  const importMutation = useMutation({
    mutationFn: async (chatGPTData: any) => {
      const response = await apiRequest('/api/ai-usage/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatGPTData }),
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/ai-usage/portfolio/${user?.id}`] });
      setShowImportDialog(false);
      setImportData("");
      toast({
        title: "AI Portfolio Updated",
        description: "Your ChatGPT conversations have been analyzed and added to your portfolio.",
      });
    },
    onError: () => {
      toast({
        title: "Import Failed",
        description: "Failed to process ChatGPT data. Please check the format and try again.",
        variant: "destructive",
      });
    },
  });

  const handleImport = () => {
    setIsProcessing(true);
    try {
      const data = JSON.parse(importData);
      importMutation.mutate(data);
    } catch (error) {
      toast({
        title: "Invalid Format",
        description: "Please paste valid JSON data from your ChatGPT export.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadPortfolio = async () => {
    try {
      const response = await fetch(`/api/ai-usage/document/${user?.id}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'AI-Proficiency-Portfolio.md';
        a.click();
        window.URL.revokeObjectURL(url);
        
        toast({
          title: "Portfolio Downloaded",
          description: "Your AI proficiency portfolio has been downloaded.",
        });
      }
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download portfolio document.",
        variant: "destructive",
      });
    }
  };

  const getProficiencyColor = (level: string) => {
    switch (level) {
      case 'expert': return 'bg-green-500';
      case 'advanced': return 'bg-blue-500';
      case 'intermediate': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getReadinessLevel = (score: number) => {
    if (score >= 80) return { label: 'Industry Ready', color: 'text-green-600', bg: 'bg-green-100' };
    if (score >= 60) return { label: 'Well Prepared', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (score >= 40) return { label: 'Developing', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { label: 'Getting Started', color: 'text-gray-600', bg: 'bg-gray-100' };
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div className="h-32 bg-gray-200 rounded-lg animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 bg-gray-200 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const hasData = portfolio && portfolio.skillCategories?.length > 0;
  const readinessLevel = getReadinessLevel(portfolio?.professionalReadiness?.score || 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            AI Proficiency Portfolio
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Showcase your professional AI skills for college applications and career opportunities
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
            <Bot className="w-4 h-4" />
            AI Portfolio Agent
            <CheckCircle2 className="w-3 h-3" />
          </div>
          <Button variant="outline" onClick={() => setShowImportDialog(true)}>
            <Upload className="w-4 h-4 mr-2" />
            Import ChatGPT
          </Button>
          {hasData && (
            <Button onClick={handleDownloadPortfolio}>
              <Download className="w-4 h-4 mr-2" />
              Download Portfolio
            </Button>
          )}
        </div>
      </div>

      {!hasData ? (
        /* Getting Started */
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Bot className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Build Your AI Proficiency Portfolio
            </h3>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              In today's job market, AI proficiency is the new literacy. Employers want to know: 
              <strong> Can you use AI to make our business better?</strong> This portfolio proves you can.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Upload className="w-6 h-6 text-blue-600" />
                </div>
                <h4 className="font-semibold mb-2">1. Import ChatGPT History</h4>
                <p className="text-sm text-gray-600">Upload your ChatGPT conversation exports</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <h4 className="font-semibold mb-2">2. AI Analysis</h4>
                <p className="text-sm text-gray-600">Our AI identifies your professional skills</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Award className="w-6 h-6 text-green-600" />
                </div>
                <h4 className="font-semibold mb-2">3. Portfolio Ready</h4>
                <p className="text-sm text-gray-600">Download proof of AI proficiency</p>
              </div>
            </div>
            <Button 
              onClick={() => setShowImportDialog(true)}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3"
            >
              <Upload className="w-5 h-5 mr-2" />
              Start Building Portfolio
            </Button>
          </CardContent>
        </Card>
      ) : (
        /* Portfolio Dashboard */
        <div className="space-y-8">
          {/* Professional Readiness Score */}
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Professional Readiness Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-3xl font-bold text-gray-900">
                    {portfolio.professionalReadiness.score}/100
                  </div>
                  <Badge className={`${readinessLevel.bg} ${readinessLevel.color} border-0`}>
                    {readinessLevel.label}
                  </Badge>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600 mb-1">
                    {portfolio.totalInteractions} AI Interactions
                  </div>
                  <div className="text-sm text-gray-600">
                    {portfolio.skillCategories.length} Skill Categories
                  </div>
                </div>
              </div>
              <Progress value={portfolio.professionalReadiness.score} className="mb-4" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Strengths</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {portfolio.professionalReadiness.strengths.map((strength, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Growth Areas</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {portfolio.professionalReadiness.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-blue-500" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Skill Categories */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">AI Skill Categories</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {portfolio.skillCategories.map((skill, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{skill.skillCategory}</CardTitle>
                      <Badge className={`${getProficiencyColor(skill.proficiencyLevel)} text-white`}>
                        {skill.proficiencyLevel}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">{skill.businessValue}</p>
                    <div className="space-y-2">
                      <div className="text-xs text-gray-500">Key Capabilities:</div>
                      <ul className="text-sm space-y-1">
                        {skill.keyCapabilities.slice(0, 3).map((cap, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <Zap className="w-3 h-3 text-blue-500" />
                            {cap}
                          </li>
                        ))}
                      </ul>
                      <div className="text-xs text-gray-500 mt-2">
                        {skill.evidenceCount} documented interactions
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Portfolio Highlights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                Portfolio Highlights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Best Examples</h4>
                  <ul className="text-sm text-gray-600 space-y-2">
                    {portfolio.portfolioHighlights.bestExamples.map((example, index) => (
                      <li key={index} className="p-2 bg-blue-50 rounded border-l-2 border-blue-300">
                        {example}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Unique Approaches</h4>
                  <ul className="text-sm text-gray-600 space-y-2">
                    {portfolio.portfolioHighlights.uniqueApproaches.map((approach, index) => (
                      <li key={index} className="p-2 bg-purple-50 rounded border-l-2 border-purple-300">
                        {approach}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Problem Solving</h4>
                  <ul className="text-sm text-gray-600 space-y-2">
                    {portfolio.portfolioHighlights.problemSolvingEvidence.map((evidence, index) => (
                      <li key={index} className="p-2 bg-green-50 rounded border-l-2 border-green-300">
                        {evidence}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Import Dialog */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Import ChatGPT Conversations</DialogTitle>
            <DialogDescription>
              Paste your ChatGPT export data (JSON format) to analyze your AI usage patterns.
              <br />
              <a 
                href="https://chat.openai.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Export your data from ChatGPT →
              </a>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Paste your ChatGPT export JSON data here..."
              value={importData}
              onChange={(e) => setImportData(e.target.value)}
              rows={10}
              className="font-mono text-sm"
            />
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowImportDialog(false)}
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleImport}
                disabled={!importData.trim() || isProcessing}
              >
                {isProcessing ? "Processing..." : "Import & Analyze"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}