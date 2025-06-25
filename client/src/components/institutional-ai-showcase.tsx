import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Brain, 
  Building, 
  Star, 
  Target, 
  Settings, 
  CheckCircle2, 
  TrendingUp,
  Users,
  Shield,
  Zap
} from "lucide-react";
import AIProviderIndicator from "./ai-provider-indicator";

export default function InstitutionalAIShowcase() {
  const institutionScenarios = [
    {
      name: "Stanford University",
      type: "Progressive Research",
      provider: "anthropic",
      model: "claude-sonnet-4",
      status: "Advanced AI Integration",
      students: 1247,
      satisfaction: 96,
      features: ["Custom Research Models", "Advanced Analytics", "Real-time Collaboration"],
      color: "bg-orange-50 border-orange-200"
    },
    {
      name: "MIT",
      type: "Enterprise Security",
      provider: "azure",
      model: "gpt-4",
      status: "Secure Enterprise Deployment",
      students: 892,
      satisfaction: 94,
      features: ["Data Sovereignty", "SLA Guarantees", "Compliance Ready"],
      color: "bg-purple-50 border-purple-200"
    },
    {
      name: "Lincoln High School",
      type: "Conservative Integration",
      provider: "custom",
      model: "school-llm-v1",
      status: "Self-hosted with Full Control",
      students: 456,
      satisfaction: 89,
      features: ["Complete Data Privacy", "Academic Integrity Focus", "Custom Policies"],
      color: "bg-gray-50 border-gray-200"
    },
    {
      name: "Education Consortium",
      type: "Multi-University Network",
      provider: "google",
      model: "gemini-2.5-pro",
      status: "Federated AI System",
      students: 3421,
      satisfaction: 92,
      features: ["Shared Resources", "Cross-institutional Analytics", "Cost Efficiency"],
      color: "bg-green-50 border-green-200"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          AI Flexibility Across Institutions
        </h2>
        <p className="text-gray-600">
          StudentOS adapts to any institution's AI preferences and policies
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {institutionScenarios.map((institution, idx) => (
          <Card key={idx} className={`${institution.color} transition-all hover:shadow-lg`}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{institution.name}</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">{institution.type}</p>
                </div>
                <Badge className="bg-white bg-opacity-80">
                  {institution.students.toLocaleString()} students
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* AI Provider Info */}
              <div className="bg-white rounded-lg p-3 border border-white border-opacity-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">AI Provider</span>
                  <AIProviderIndicator 
                    provider={institution.provider}
                    model={institution.model}
                    variant="compact"
                  />
                </div>
                <p className="text-xs text-gray-600">{institution.status}</p>
              </div>

              {/* Key Features */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Key Features</h4>
                <div className="space-y-1">
                  {institution.features.map((feature, featureIdx) => (
                    <div key={featureIdx} className="flex items-center gap-2 text-xs text-gray-600">
                      <CheckCircle2 className="w-3 h-3 text-green-600" />
                      {feature}
                    </div>
                  ))}
                </div>
              </div>

              {/* Satisfaction Score */}
              <div className="bg-white rounded-lg p-3 border border-white border-opacity-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Student Satisfaction</span>
                  <span className="text-lg font-bold text-green-600">{institution.satisfaction}%</span>
                </div>
                <Progress value={institution.satisfaction} className="h-2" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Call to Action */}
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
        <CardContent className="p-6 text-center">
          <Brain className="w-12 h-12 mx-auto text-blue-600 mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Your Institution's AI Strategy
          </h3>
          <p className="text-gray-700 mb-4">
            Configure StudentOS to work with your preferred AI models and policies. 
            Maintain institutional values while building student AI proficiency.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Settings className="w-4 h-4 mr-2" />
              Configure AI Provider
            </Button>
            <Button variant="outline">
              <Users className="w-4 h-4 mr-2" />
              Schedule Demo
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}