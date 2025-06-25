import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  FileText, 
  Clock, 
  TrendingUp, 
  Star,
  Eye,
  Edit,
  Share,
  MoreHorizontal,
  Calendar,
  Target,
  Lightbulb
} from "lucide-react";
import { Essay, AiSuggestion } from "@shared/schema";

interface EnhancedEssayCardProps {
  essay: Essay;
  suggestions?: AiSuggestion[];
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onAnalyze: (id: string) => void;
  className?: string;
}

export default function EnhancedEssayCard({ 
  essay, 
  suggestions = [], 
  onView, 
  onEdit, 
  onAnalyze,
  className 
}: EnhancedEssayCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-600";
    if (score >= 6) return "text-yellow-600";
    return "text-red-600";
  };

  const getOverallScore = () => {
    if (!essay.clarityScore || !essay.impactScore || !essay.originalityScore) return null;
    return Math.round((essay.clarityScore + essay.impactScore + essay.originalityScore) / 3);
  };

  const overallScore = getOverallScore();
  const wordCount = essay.content.split(' ').length;
  const hasHighImpactSuggestions = suggestions.some(s => s.impact === 'high');

  return (
    <Card 
      className={`transition-all duration-200 hover:shadow-lg hover:scale-[1.02] cursor-pointer ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onView(essay.id)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg leading-6 truncate pr-2">
              {essay.title}
            </CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              <Calendar className="w-3 h-3" />
              {new Date(essay.createdAt).toLocaleDateString()}
              <span className="text-gray-400">•</span>
              <span>{wordCount} words</span>
            </CardDescription>
          </div>
          
          {overallScore && (
            <div className="flex items-center gap-1">
              <Star className={`w-4 h-4 ${getScoreColor(overallScore)}`} />
              <span className={`font-semibold ${getScoreColor(overallScore)}`}>
                {overallScore}/10
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 mt-2">
          <Badge variant="outline" className="text-xs">
            {essay.essayType}
          </Badge>
          
          {essay.status === "analyzed" && (
            <Badge variant="default" className="text-xs">
              <TrendingUp className="w-2 h-2 mr-1" />
              Analyzed
            </Badge>
          )}
          
          {hasHighImpactSuggestions && (
            <Badge variant="secondary" className="text-xs">
              <Lightbulb className="w-2 h-2 mr-1" />
              High Impact Tips
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <p className="text-sm text-gray-600 line-clamp-2 mb-4">
          {essay.prompt}
        </p>

        {/* Score Breakdown */}
        {essay.clarityScore && essay.impactScore && essay.originalityScore && (
          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Clarity</span>
              <span className={getScoreColor(essay.clarityScore)}>{essay.clarityScore}/10</span>
            </div>
            <Progress value={essay.clarityScore * 10} className="h-1" />
            
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Impact</span>
              <span className={getScoreColor(essay.impactScore)}>{essay.impactScore}/10</span>
            </div>
            <Progress value={essay.impactScore * 10} className="h-1" />
            
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Originality</span>
              <span className={getScoreColor(essay.originalityScore)}>{essay.originalityScore}/10</span>
            </div>
            <Progress value={essay.originalityScore * 10} className="h-1" />
          </div>
        )}

        {/* Action Buttons */}
        <div className={`flex gap-2 transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onView(essay.id);
            }}
            className="flex-1"
          >
            <Eye className="w-3 h-3 mr-1" />
            View
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(essay.id);
            }}
            className="flex-1"
          >
            <Edit className="w-3 h-3 mr-1" />
            Edit
          </Button>
          
          {essay.status !== "analyzed" && (
            <Button
              variant="default"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onAnalyze(essay.id);
              }}
              className="flex-1"
            >
              <TrendingUp className="w-3 h-3 mr-1" />
              Analyze
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}