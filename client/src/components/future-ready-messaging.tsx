import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  Shield, 
  Target, 
  Users, 
  Brain,
  CheckCircle2,
  AlertTriangle,
  Star
} from "lucide-react";

interface FutureReadyMessagingProps {
  audience: 'parents' | 'students' | 'counselors';
}

export default function FutureReadyMessaging({ audience }: FutureReadyMessagingProps) {
  const messaging = {
    parents: {
      title: "Future-Proof Your Child's Education",
      subtitle: "AI proficiency is the new digital literacy. Students who build these skills now have a 2-3 year advantage.",
      concerns: [
        {
          question: "Is my child cheating with AI?",
          answer: "No - they're learning to collaborate with AI responsibly, just like they learned calculators and computers.",
          icon: Shield
        },
        {
          question: "Will this help with college applications?",
          answer: "Yes - elite universities actively seek AI-literate students. Early proficiency provides significant competitive advantage.",
          icon: Target
        },
        {
          question: "What about academic integrity?",
          answer: "Complete transparency with 25% similarity caps, audit trails, and voice preservation algorithms maintaining authenticity.",
          icon: CheckCircle2
        }
      ],
      cta: "Give Your Child the Advantage"
    },
    students: {
      title: "Prove You Can Use AI to Make Businesses Better",
      subtitle: "The skill every employer wants. Build your AI portfolio and stand out in applications.",
      concerns: [
        {
          question: "How does this help my college applications?",
          answer: "Transform your ChatGPT conversations into demonstrable professional skills that prove AI proficiency.",
          icon: Star
        },
        {
          question: "Will I become dependent on AI?",
          answer: "No - focus on skill development over content generation. Build critical thinking with AI collaboration.",
          icon: Brain
        },
        {
          question: "What if my school doesn't allow AI?",
          answer: "StudentOS adapts to any institutional comfort level while building future-ready skills responsibly.",
          icon: TrendingUp
        }
      ],
      cta: "Start Building Your AI Advantage"
    },
    counselors: {
      title: "Help Students Use AI Responsibly",
      subtitle: "Address parent concerns while building career-ready skills that differentiate your students.",
      concerns: [
        {
          question: "How do I handle parent AI concerns?",
          answer: "Complete transparency tools with audit trails, similarity detection, and clear AI assistance disclosure.",
          icon: Users
        },
        {
          question: "Will this actually help students?",
          answer: "Measurable skill development in AI collaboration - the #1 skill employers seek in new graduates.",
          icon: TrendingUp
        },
        {
          question: "What about different school policies?",
          answer: "Flexible implementation supporting conservative to progressive institutional comfort levels.",
          icon: Shield
        }
      ],
      cta: "Lead Responsible AI Education"
    }
  };

  const content = messaging[audience];

  return (
    <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50">
      <CardContent className="p-8">
        <div className="text-center mb-8">
          <Badge className="bg-blue-600 text-white mb-4">
            The Future is Now
          </Badge>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {content.title}
          </h2>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            {content.subtitle}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {content.concerns.map((concern, idx) => {
            const IconComponent = concern.icon;
            return (
              <Card key={idx} className="border-white bg-white/80">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3 mb-3">
                    <IconComponent className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                    <h3 className="font-semibold text-gray-900">
                      {concern.question}
                    </h3>
                  </div>
                  <p className="text-gray-700 text-sm">
                    {concern.answer}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Market Reality Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">2-3 Years</div>
            <div className="text-sm text-gray-600">Early Adopter Advantage</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">84%</div>
            <div className="text-sm text-gray-600">Employers Seek AI Skills</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">5x</div>
            <div className="text-sm text-gray-600">Higher Application Success</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">100%</div>
            <div className="text-sm text-gray-600">Future Jobs Need AI</div>
          </div>
        </div>

        {/* Institution Transition Tracker */}
        <Card className="border-orange-200 bg-orange-50 mb-6">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-orange-900 mb-1">
                  The AI Education Gap is Widening
                </h4>
                <p className="text-orange-800 text-sm mb-3">
                  While institutions debate AI policies, students building AI proficiency now will have massive advantages. 
                  Don't let your {audience === 'parents' ? 'child' : 'students'} fall behind while schools catch up.
                </p>
                <div className="flex flex-wrap gap-2 text-xs">
                  <Badge className="bg-red-100 text-red-800 border-red-200">Conservative Schools: "AI is cheating"</Badge>
                  <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Moderate Schools: "Wait and see"</Badge>
                  <Badge className="bg-green-100 text-green-800 border-green-200">Progressive Schools: "AI proficiency required"</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <Button 
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3"
            onClick={() => window.location.href = "/api/login"}
          >
            {content.cta}
          </Button>
          <p className="text-sm text-gray-600 mt-3">
            Start free • No commitment • Immediate results
          </p>
        </div>
      </CardContent>
    </Card>
  );
}