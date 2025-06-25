import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, AlertTriangle, Clock, TrendingUp, University, Building } from "lucide-react";

export default function InstitutionalReadinessTracker() {
  const institutions = [
    {
      name: "Elite Private Universities",
      category: "Universities",
      readiness: 75,
      status: "early-adopter",
      examples: ["MIT", "Stanford", "Harvard"],
      aiPolicy: "Encouraging AI literacy courses and ethical AI use policies",
      adoptionSignals: [
        "AI-focused computer science programs",
        "Ethics of AI coursework requirements",
        "Research partnerships with AI companies"
      ]
    },
    {
      name: "State Universities",
      category: "Universities", 
      readiness: 45,
      status: "cautious-observer",
      examples: ["UC System", "University of Texas", "University of Florida"],
      aiPolicy: "Developing guidelines while maintaining academic integrity standards",
      adoptionSignals: [
        "Faculty AI training programs",
        "Student AI literacy initiatives",
        "Pilot programs in select departments"
      ]
    },
    {
      name: "Community Colleges",
      category: "Universities",
      readiness: 30,
      status: "traditional",
      examples: ["Local community colleges"],
      aiPolicy: "Limited AI integration, focus on fundamental skills",
      adoptionSignals: [
        "Basic digital literacy programs",
        "Industry partnership discussions",
        "Workforce development alignment"
      ]
    },
    {
      name: "Fortune 500 Companies",
      category: "Employers",
      readiness: 85,
      status: "ai-native",
      examples: ["Microsoft", "Google", "McKinsey"],
      aiPolicy: "Actively seeking AI-proficient candidates",
      adoptionSignals: [
        "AI skills in job descriptions",
        "AI proficiency testing in interviews",
        "Internal AI training programs"
      ]
    },
    {
      name: "Traditional Industries",
      category: "Employers",
      readiness: 55,
      status: "emerging",
      examples: ["Healthcare", "Finance", "Manufacturing"],
      aiPolicy: "Cautious integration with compliance focus",
      adoptionSignals: [
        "AI pilot projects",
        "Employee AI training initiatives",
        "Vendor AI solution adoption"
      ]
    },
    {
      name: "High School Systems",
      category: "K-12",
      readiness: 25,
      status: "resistant",
      examples: ["Public school districts"],
      aiPolicy: "Restrictive policies, academic integrity concerns",
      adoptionSignals: [
        "Teacher AI literacy training",
        "Administrative policy development",
        "Gradual technology integration"
      ]
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ai-native': return 'bg-green-500';
      case 'early-adopter': return 'bg-blue-500';
      case 'emerging': return 'bg-yellow-500';
      case 'cautious-observer': return 'bg-orange-500';
      case 'traditional': return 'bg-gray-500';
      case 'resistant': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ai-native': return 'AI-Native';
      case 'early-adopter': return 'Early Adopter';
      case 'emerging': return 'Emerging';
      case 'cautious-observer': return 'Cautious Observer';
      case 'traditional': return 'Traditional';
      case 'resistant': return 'Resistant';
      default: return 'Unknown';
    }
  };

  const getIcon = (category: string) => {
    switch (category) {
      case 'Universities': return University;
      case 'Employers': return Building;
      case 'K-12': return CheckCircle2;
      default: return AlertTriangle;
    }
  };

  const categories = ['Universities', 'Employers', 'K-12'];

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Institutional AI Readiness Tracker
        </h2>
        <p className="text-gray-600">
          Monitoring adoption patterns to guide our strategy and student preparation
        </p>
      </div>

      {categories.map(category => {
        const categoryInstitutions = institutions.filter(inst => inst.category === category);
        const avgReadiness = Math.round(
          categoryInstitutions.reduce((sum, inst) => sum + inst.readiness, 0) / categoryInstitutions.length
        );
        const IconComponent = getIcon(category);

        return (
          <div key={category} className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <IconComponent className="w-6 h-6 text-gray-700" />
              <h3 className="text-xl font-semibold text-gray-900">{category}</h3>
              <Badge variant="outline">
                {avgReadiness}% Ready
              </Badge>
            </div>

            <div className="grid gap-4">
              {categoryInstitutions.map((institution, index) => (
                <Card key={index} className="border-l-4" style={{ borderLeftColor: 'var(--border)' }}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{institution.name}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge className={`${getStatusColor(institution.status)} text-white border-0`}>
                          {getStatusText(institution.status)}
                        </Badge>
                        <span className="text-sm font-medium">{institution.readiness}%</span>
                      </div>
                    </div>
                    <Progress value={institution.readiness} className="h-2 mt-2" />
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Current AI Policy:</p>
                        <p className="text-sm text-gray-600">{institution.aiPolicy}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Examples:</p>
                        <p className="text-sm text-gray-600">{institution.examples.join(", ")}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Adoption Signals:</p>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {institution.adoptionSignals.map((signal, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                              {signal}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      })}

      {/* Strategic Insights */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <TrendingUp className="w-5 h-5" />
            Strategic Insights for StudentOS
          </CardTitle>
        </CardHeader>
        <CardContent className="text-blue-800">
          <div className="space-y-3 text-sm">
            <div>
              <span className="font-medium">Opportunity Window:</span> Elite universities and employers are ready now, creating first-mover advantage for AI-proficient students.
            </div>
            <div>
              <span className="font-medium">Bridge Strategy:</span> Position StudentOS as responsible AI education that satisfies traditionalists while building skills valued by progressives.
            </div>
            <div>
              <span className="font-medium">Timing Advantage:</span> Students building AI portfolios today will be 2-3 years ahead when mainstream institutions catch up.
            </div>
            <div>
              <span className="font-medium">Parent Value Prop:</span> "Future-proofing" students for an AI-enabled world while maintaining academic integrity.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}