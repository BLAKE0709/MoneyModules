import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, Eye, FileText, Users, CheckCircle2, Download, ExternalLink } from "lucide-react";

export default function EthicsTransparencyCenter() {
  const transparencyMeasures = [
    {
      title: "AI Usage Disclosure",
      description: "All AI-assisted work is clearly labeled with generation timestamp and confidence scores",
      status: "implemented",
      details: "Students can export disclosure reports for college applications"
    },
    {
      title: "Voice Preservation Analysis", 
      description: "Algorithm ensures student's authentic voice remains dominant in all improvements",
      status: "implemented",
      details: "Maintains 75%+ original student writing patterns and vocabulary"
    },
    {
      title: "Similarity Detection",
      description: "Content similarity capped at 25% to ensure original thinking",
      status: "implemented", 
      details: "Real-time checking against existing student work and online sources"
    },
    {
      title: "Skill Building Focus",
      description: "Platform emphasizes learning and improvement over content generation",
      status: "implemented",
      details: "Progress tracking shows skill development over time"
    },
    {
      title: "Parental Oversight",
      description: "Parents receive usage reports and can configure AI assistance levels",
      status: "beta",
      details: "Weekly reports on student AI interaction patterns and learning progress"
    },
    {
      title: "Institutional Guidelines",
      description: "Compliance tools for different school and university AI policies",
      status: "development",
      details: "Customizable settings to match institutional requirements"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'implemented': return 'bg-green-100 text-green-800 border-green-200';
      case 'beta': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'development': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const principles = [
    {
      icon: Shield,
      title: "Academic Integrity First",
      description: "All features designed to enhance learning while maintaining authenticity"
    },
    {
      icon: Eye,
      title: "Full Transparency",
      description: "Complete visibility into AI assistance levels and decision-making processes"
    },
    {
      icon: Users,
      title: "Student Empowerment",
      description: "Building genuine AI proficiency that serves students throughout their careers"
    },
    {
      icon: FileText,
      title: "Institutional Compliance", 
      description: "Flexible policies to meet varying institutional requirements and comfort levels"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Ethics & Transparency Center
        </h2>
        <p className="text-gray-600">
          Building trust through responsible AI education and complete transparency
        </p>
      </div>

      {/* Core Principles */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {principles.map((principle, index) => {
          const IconComponent = principle.icon;
          return (
            <Card key={index} className="border-blue-200 bg-blue-50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <IconComponent className="w-6 h-6 text-blue-600 mt-1" />
                  <div>
                    <h3 className="font-semibold text-blue-900 mb-1">{principle.title}</h3>
                    <p className="text-blue-800 text-sm">{principle.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Transparency Measures */}
      <Card>
        <CardHeader>
          <CardTitle>Transparency Measures</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transparencyMeasures.map((measure, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{measure.title}</h4>
                  <Badge className={getStatusColor(measure.status)}>
                    {measure.status === 'implemented' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                    {measure.status.charAt(0).toUpperCase() + measure.status.slice(1)}
                  </Badge>
                </div>
                <p className="text-gray-600 text-sm mb-2">{measure.description}</p>
                <p className="text-gray-500 text-xs">{measure.details}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Institutional Adaptation Strategy */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="text-green-900">Institutional Adaptation Strategy</CardTitle>
        </CardHeader>
        <CardContent className="text-green-800">
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">For Conservative Institutions</h4>
              <ul className="text-sm space-y-1">
                <li>• Emphasize skill-building and learning enhancement over content generation</li>
                <li>• Provide detailed AI usage reports for academic integrity verification</li>
                <li>• Offer "training wheels" mode with limited AI assistance</li>
                <li>• Show measurable improvement in student critical thinking</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">For Progressive Institutions</h4>
              <ul className="text-sm space-y-1">
                <li>• Highlight AI proficiency as competitive advantage for students</li>
                <li>• Demonstrate real-world skill application and career readiness</li>
                <li>• Provide advanced analytics on student AI collaboration patterns</li>
                <li>• Showcase innovation in responsible AI education</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Universal Value Propositions</h4>
              <ul className="text-sm space-y-1">
                <li>• Students learn to use AI responsibly rather than secretly</li>
                <li>• Complete transparency builds trust with all stakeholders</li>
                <li>• Future-proofing students for an AI-enabled world</li>
                <li>• Maintaining academic integrity while building modern skills</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Items for Institutional Readiness */}
      <Card>
        <CardHeader>
          <CardTitle>Resources for Institutions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <Button variant="outline" className="justify-start h-auto p-4">
              <div className="text-left">
                <div className="flex items-center gap-2 mb-1">
                  <Download className="w-4 h-4" />
                  <span className="font-medium">AI Policy Template</span>
                </div>
                <p className="text-sm text-gray-600">Customizable policy framework for educational institutions</p>
              </div>
            </Button>

            <Button variant="outline" className="justify-start h-auto p-4">
              <div className="text-left">
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="w-4 h-4" />
                  <span className="font-medium">Research White Paper</span>
                </div>
                <p className="text-sm text-gray-600">Evidence-based approach to responsible AI in education</p>
              </div>
            </Button>

            <Button variant="outline" className="justify-start h-auto p-4">
              <div className="text-left">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="w-4 h-4" />
                  <span className="font-medium">Pilot Program Guide</span>
                </div>
                <p className="text-sm text-gray-600">Step-by-step implementation for hesitant institutions</p>
              </div>
            </Button>

            <Button variant="outline" className="justify-start h-auto p-4">
              <div className="text-left">
                <div className="flex items-center gap-2 mb-1">
                  <ExternalLink className="w-4 h-4" />
                  <span className="font-medium">Success Case Studies</span>
                </div>
                <p className="text-sm text-gray-600">Real examples of successful AI education integration</p>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}