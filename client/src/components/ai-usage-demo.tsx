import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Brain, MessageSquare, TrendingUp, Award } from "lucide-react";

export default function AIUsageDemo() {
  const aiSkills = [
    {
      category: "Research & Analysis",
      score: 92,
      examples: ["Market research for startup ideas", "Academic literature reviews", "Competitive analysis"],
      color: "bg-blue-50 border-blue-200"
    },
    {
      category: "Problem Solving",
      score: 88,
      examples: ["Debug complex code issues", "Strategy optimization", "Creative brainstorming"],
      color: "bg-green-50 border-green-200"
    },
    {
      category: "Content Creation",
      score: 95,
      examples: ["Professional writing assistance", "Technical documentation", "Creative ideation"],
      color: "bg-purple-50 border-purple-200"
    },
    {
      category: "Technical Assistance",
      score: 85,
      examples: ["Code review and optimization", "Architecture planning", "Troubleshooting"],
      color: "bg-orange-50 border-orange-200"
    }
  ];

  const conversationStats = {
    totalConversations: 247,
    totalTokens: "1.2M",
    averageComplexity: "Advanced",
    topCategories: ["Research", "Problem Solving", "Writing"]
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">AI Usage Portfolio</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Demonstrate your AI collaboration skills to colleges and employers. Transform your ChatGPT conversations into professional competency evidence.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 text-center">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <div className="text-2xl font-bold">{conversationStats.totalConversations}</div>
            <div className="text-sm text-gray-600">AI Conversations</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Brain className="w-8 h-8 mx-auto mb-2 text-green-600" />
            <div className="text-2xl font-bold">{conversationStats.totalTokens}</div>
            <div className="text-sm text-gray-600">Tokens Processed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-8 h-8 mx-auto mb-2 text-purple-600" />
            <div className="text-2xl font-bold">{conversationStats.averageComplexity}</div>
            <div className="text-sm text-gray-600">Complexity Level</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Award className="w-8 h-8 mx-auto mb-2 text-orange-600" />
            <div className="text-2xl font-bold">A+</div>
            <div className="text-sm text-gray-600">AI Proficiency</div>
          </CardContent>
        </Card>
      </div>

      {/* AI Skills Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>AI Collaboration Skills</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {aiSkills.map((skill, index) => (
              <div key={index} className={`p-4 rounded-lg border ${skill.color}`}>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold">{skill.category}</h3>
                  <Badge variant="secondary">{skill.score}% Proficiency</Badge>
                </div>
                <Progress value={skill.score} className="mb-3" />
                <div className="flex flex-wrap gap-2">
                  {skill.examples.map((example, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {example}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Portfolio Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="h-auto p-4 flex flex-col items-center space-y-2">
              <MessageSquare className="w-6 h-6" />
              <span>Import ChatGPT Data</span>
              <span className="text-xs text-gray-500">Connect your conversations</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
              <TrendingUp className="w-6 h-6" />
              <span>Generate Report</span>
              <span className="text-xs text-gray-500">Professional portfolio PDF</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
              <Award className="w-6 h-6" />
              <span>Share Portfolio</span>
              <span className="text-xs text-gray-500">Send to colleges/employers</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Value Proposition */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-3">Why AI Proficiency Matters</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">For College Applications:</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Demonstrate technological literacy</li>
                <li>• Show problem-solving capabilities</li>
                <li>• Highlight research and analysis skills</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">For Future Employment:</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Prove AI collaboration experience</li>
                <li>• Show efficiency and productivity gains</li>
                <li>• Demonstrate future-ready skill set</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}