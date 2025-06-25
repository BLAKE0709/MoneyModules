import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Bot, TrendingUp, Award, Zap, CheckCircle2, FileText, Upload } from "lucide-react";

export default function AIUsageDemo() {
  const [showDemo, setShowDemo] = useState(false);

  const demoSkills = [
    {
      skillCategory: "Research & Analysis",
      proficiencyLevel: "advanced" as const,
      evidenceCount: 23,
      keyCapabilities: ["Complex query formulation", "Source verification", "Multi-perspective synthesis"],
      businessValue: "Can conduct thorough market research and competitive analysis using AI tools",
      portfolioSummary: "Demonstrated advanced research skills through systematic AI-powered analysis"
    },
    {
      skillCategory: "Creative Problem Solving",
      proficiencyLevel: "expert" as const,
      evidenceCount: 18,
      keyCapabilities: ["Innovative brainstorming", "Solution iteration", "Creative constraints"],
      businessValue: "Leverages AI for breakthrough thinking and novel solution development",
      portfolioSummary: "Expert-level creative collaboration with AI for business innovation"
    },
    {
      skillCategory: "Technical Assistance",
      proficiencyLevel: "intermediate" as const,
      evidenceCount: 15,
      keyCapabilities: ["Code debugging", "Architecture planning", "Documentation"],
      businessValue: "Uses AI to accelerate technical development and problem resolution",
      portfolioSummary: "Growing technical proficiency with AI-assisted development workflows"
    }
  ];

  const demoLedger = {
    totalInteractions: 156,
    skillCategories: demoSkills,
    professionalReadiness: {
      score: 87,
      strengths: ["Research & Analysis", "Creative Problem Solving"],
      recommendations: ["Explore AI applications in data analysis", "Document business outcomes from AI projects"]
    },
    portfolioHighlights: {
      bestExamples: [
        "Systematic market research using AI-powered analysis",
        "Creative collaboration for product innovation",
        "Technical problem-solving with AI assistance"
      ],
      uniqueApproaches: [
        "Multi-step reasoning chains",
        "Creative constraint application",
        "Iterative solution refinement"
      ],
      problemSolvingEvidence: [
        "Can conduct thorough market research using AI tools",
        "Leverages AI for breakthrough business thinking",
        "Uses AI to accelerate technical development"
      ]
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

  if (!showDemo) {
    return (
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardContent className="p-6 text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Bot className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            AI Proficiency Portfolio Preview
          </h3>
          <p className="text-gray-600 mb-4 text-sm">
            See how ChatGPT conversations transform into professional skills
          </p>
          <Button 
            onClick={() => setShowDemo(true)}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            View Demo Portfolio
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Professional Readiness Score */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              Professional Readiness Score
            </CardTitle>
            <Badge className="bg-green-100 text-green-800 border-0">
              Industry Ready
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-3xl font-bold text-gray-900">87/100</div>
              <div className="text-sm text-gray-600">
                {demoLedger.totalInteractions} AI Interactions Analyzed
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600 mb-1">
                {demoLedger.skillCategories.length} Skill Categories
              </div>
              <div className="text-xs text-green-600 font-medium">
                Ready for professional AI usage
              </div>
            </div>
          </div>
          <Progress value={87} className="mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2 text-sm">Strengths</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                {demoLedger.professionalReadiness.strengths.map((strength, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <CheckCircle2 className="w-3 h-3 text-green-500" />
                    {strength}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-sm">Growth Areas</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                {demoLedger.professionalReadiness.recommendations.slice(0, 2).map((rec, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <TrendingUp className="w-3 h-3 text-blue-500" />
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
        <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Skill Categories</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {demoSkills.map((skill, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">{skill.skillCategory}</CardTitle>
                  <Badge className={`${getProficiencyColor(skill.proficiencyLevel)} text-white text-xs`}>
                    {skill.proficiencyLevel}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-xs text-gray-600 mb-3">{skill.businessValue}</p>
                <div className="space-y-2">
                  <div className="text-xs text-gray-500">Key Capabilities:</div>
                  <ul className="text-xs space-y-1">
                    {skill.keyCapabilities.slice(0, 2).map((cap, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <Zap className="w-2 h-2 text-blue-500" />
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

      {/* CTA */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardContent className="p-4 text-center">
          <p className="text-sm text-gray-700 mb-3">
            <strong>This is the competitive advantage employers want to see.</strong>
            <br />
            Prove you can use AI to make businesses better.
          </p>
          <div className="flex justify-center gap-2">
            <Button 
              size="sm"
              variant="outline"
              onClick={() => setShowDemo(false)}
            >
              Close Demo
            </Button>
            <Button 
              size="sm"
              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
            >
              <Upload className="w-3 h-3 mr-2" />
              Build My Portfolio
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}