import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from "recharts";
import { 
  BookOpen, 
  Target, 
  Lightbulb, 
  TrendingUp,
  Users,
  Brain
} from "lucide-react";

interface WritingAnalysis {
  complexity: number;
  vocabulary: number;
  clarity: number;
  engagement: number;
  authenticity: number;
  persuasiveness: number;
}

interface WritingStyleVisualizationProps {
  analysis: WritingAnalysis;
  sampleCount: number;
  strengths: string[];
  recommendations: string[];
}

export default function WritingStyleVisualization({ 
  analysis, 
  sampleCount, 
  strengths, 
  recommendations 
}: WritingStyleVisualizationProps) {
  const radarData = [
    { subject: 'Complexity', score: analysis.complexity, fullMark: 10 },
    { subject: 'Vocabulary', score: analysis.vocabulary, fullMark: 10 },
    { subject: 'Clarity', score: analysis.clarity, fullMark: 10 },
    { subject: 'Engagement', score: analysis.engagement, fullMark: 10 },
    { subject: 'Authenticity', score: analysis.authenticity, fullMark: 10 },
    { subject: 'Persuasion', score: analysis.persuasiveness, fullMark: 10 },
  ];

  const barData = [
    { name: 'Complexity', score: analysis.complexity },
    { name: 'Vocabulary', score: analysis.vocabulary },
    { name: 'Clarity', score: analysis.clarity },
    { name: 'Engagement', score: analysis.engagement },
    { name: 'Authenticity', score: analysis.authenticity },
    { name: 'Persuasion', score: analysis.persuasiveness },
  ];

  const overallScore = Math.round(
    (analysis.complexity + analysis.vocabulary + analysis.clarity + 
     analysis.engagement + analysis.authenticity + analysis.persuasiveness) / 6
  );

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-600";
    if (score >= 6) return "text-yellow-600";
    return "text-red-600";
  };

  const getProgressColor = (score: number) => {
    if (score >= 8) return "bg-green-500";
    if (score >= 6) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Overall Score Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Writing Style Profile
          </CardTitle>
          <CardDescription>
            Based on {sampleCount} writing sample{sampleCount !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-6">
            <div className={`text-4xl font-bold ${getScoreColor(overallScore)}`}>
              {overallScore}/10
            </div>
            <p className="text-gray-500 mt-1">Overall Writing Score</p>
          </div>

          <div className="space-y-4">
            {radarData.map((item) => (
              <div key={item.subject}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{item.subject}</span>
                  <span className={getScoreColor(item.score)}>{item.score}/10</span>
                </div>
                <Progress value={item.score * 10} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Radar Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Style Radar
          </CardTitle>
          <CardDescription>
            Comprehensive writing ability breakdown
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
              <PolarRadiusAxis 
                domain={[0, 10]} 
                tick={{ fontSize: 10 }} 
                tickCount={6}
              />
              <Radar
                name="Score"
                dataKey="score"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.1}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Strengths */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Key Strengths
          </CardTitle>
          <CardDescription>
            What makes your writing unique
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {strengths.map((strength, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                <p className="text-sm">{strength}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            Growth Areas
          </CardTitle>
          <CardDescription>
            Personalized improvement suggestions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recommendations.map((rec, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                <p className="text-sm">{rec}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}