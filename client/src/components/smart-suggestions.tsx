import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Lightbulb, 
  TrendingUp, 
  Target, 
  BookOpen, 
  ArrowRight,
  CheckCircle2,
  Clock
} from "lucide-react";

interface SmartSuggestion {
  id: string;
  type: "essay_match" | "writing_style" | "improvement_tip" | "deadline_reminder";
  title: string;
  description: string;
  actionLabel: string;
  priority: "high" | "medium" | "low";
  relevantEssay?: string;
  relevantSample?: string;
  dueDate?: string;
}

interface SmartSuggestionsProps {
  suggestions: SmartSuggestion[];
  onAction: (suggestionId: string) => void;
}

export default function SmartSuggestions({ suggestions, onAction }: SmartSuggestionsProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case "essay_match": return Target;
      case "writing_style": return BookOpen;
      case "improvement_tip": return TrendingUp;
      case "deadline_reminder": return Clock;
      default: return Lightbulb;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "border-red-200 bg-red-50";
      case "medium": return "border-yellow-200 bg-yellow-50";
      case "low": return "border-blue-200 bg-blue-50";
      default: return "border-gray-200 bg-gray-50";
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (suggestions.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-green-500" />
          <h3 className="text-lg font-medium mb-2">All caught up!</h3>
          <p className="text-gray-600">
            No new suggestions at the moment. Keep writing to get more personalized tips.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="w-5 h-5 text-yellow-500" />
        <h2 className="text-xl font-semibold">Smart Suggestions</h2>
        <Badge variant="secondary">{suggestions.length}</Badge>
      </div>

      {suggestions.map((suggestion) => {
        const Icon = getIcon(suggestion.type);
        
        return (
          <Card 
            key={suggestion.id} 
            className={`transition-all hover:shadow-md ${getPriorityColor(suggestion.priority)}`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-white">
                    <Icon className="w-5 h-5 text-gray-700" />
                  </div>
                  <div>
                    <CardTitle className="text-base leading-tight">
                      {suggestion.title}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getPriorityBadge(suggestion.priority)}`}
                      >
                        {suggestion.priority} priority
                      </Badge>
                      {suggestion.dueDate && (
                        <Badge variant="outline" className="text-xs">
                          Due: {new Date(suggestion.dueDate).toLocaleDateString()}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => onAction(suggestion.id)}
                  className="flex-shrink-0"
                >
                  {suggestion.actionLabel}
                  <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-gray-600">
                {suggestion.description}
              </p>
              
              {(suggestion.relevantEssay || suggestion.relevantSample) && (
                <div className="mt-3 p-3 bg-white rounded-lg border">
                  <div className="text-xs text-gray-500 mb-1">Related to:</div>
                  <div className="text-sm font-medium">
                    {suggestion.relevantEssay || suggestion.relevantSample}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}