import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Trophy, 
  Star, 
  Target, 
  BookOpen, 
  PenTool, 
  TrendingUp,
  Award,
  Zap,
  CheckCircle2
} from "lucide-react";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  progress: number;
  maxProgress: number;
  unlocked: boolean;
  category: "writing" | "analysis" | "improvement" | "consistency";
  points: number;
}

interface AchievementSystemProps {
  totalPoints: number;
  level: number;
  nextLevelPoints: number;
  achievements: Achievement[];
}

export default function AchievementSystem({ 
  totalPoints, 
  level, 
  nextLevelPoints, 
  achievements 
}: AchievementSystemProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categories = [
    { id: "all", label: "All Achievements", icon: Trophy },
    { id: "writing", label: "Writing", icon: PenTool },
    { id: "analysis", label: "Analysis", icon: Target },
    { id: "improvement", label: "Improvement", icon: TrendingUp },
    { id: "consistency", label: "Consistency", icon: Zap },
  ];

  const filteredAchievements = selectedCategory === "all" 
    ? achievements 
    : achievements.filter(a => a.category === selectedCategory);

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const levelProgress = ((totalPoints % nextLevelPoints) / nextLevelPoints) * 100;

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "writing": return "bg-blue-100 text-blue-800";
      case "analysis": return "bg-green-100 text-green-800";
      case "improvement": return "bg-purple-100 text-purple-800";
      case "consistency": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Level Progress */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                Level {level} Writer
              </CardTitle>
              <CardDescription>
                {totalPoints} total points • {unlockedCount}/{achievements.length} achievements unlocked
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">{totalPoints}</div>
              <div className="text-sm text-gray-500">points</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress to Level {level + 1}</span>
              <span>{totalPoints % nextLevelPoints}/{nextLevelPoints}</span>
            </div>
            <Progress value={levelProgress} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                selectedCategory === category.id
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
              }`}
            >
              <Icon className="w-4 h-4" />
              {category.label}
            </button>
          );
        })}
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAchievements.map((achievement) => {
          const Icon = achievement.icon;
          const progressPercentage = (achievement.progress / achievement.maxProgress) * 100;

          return (
            <Card 
              key={achievement.id} 
              className={`transition-all duration-200 ${
                achievement.unlocked 
                  ? "bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200" 
                  : "opacity-75 hover:opacity-100"
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      achievement.unlocked 
                        ? "bg-yellow-100 text-yellow-700" 
                        : "bg-gray-100 text-gray-500"
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base leading-tight">
                        {achievement.title}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getCategoryColor(achievement.category)}`}
                        >
                          {achievement.category}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {achievement.points} pts
                        </span>
                      </div>
                    </div>
                  </div>
                  {achievement.unlocked && (
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-3">
                  {achievement.description}
                </p>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Progress</span>
                    <span className={achievement.unlocked ? "text-green-600 font-medium" : "text-gray-600"}>
                      {achievement.progress}/{achievement.maxProgress}
                    </span>
                  </div>
                  <Progress 
                    value={progressPercentage} 
                    className={`h-2 ${achievement.unlocked ? "bg-green-100" : ""}`}
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}