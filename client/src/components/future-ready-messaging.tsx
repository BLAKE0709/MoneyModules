import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, Shield, Brain, Target, Clock, Star } from "lucide-react";

interface FutureReadyMessagingProps {
  audience: 'parents' | 'students' | 'counselors' | 'institutions';
}

export default function FutureReadyMessaging({ audience }: FutureReadyMessagingProps) {
  const getMessaging = () => {
    switch (audience) {
      case 'parents':
        return {
          headline: "Future-Proof Your Child's Education",
          subheadline: "Build AI proficiency the right way - responsibly and transparently",
          keyPoints: [
            {
              icon: Shield,
              title: "Academic Integrity Maintained",
              description: "AI enhances learning without compromising authenticity",
              parentConcern: "Addresses: 'Is my child cheating?'"
            },
            {
              icon: TrendingUp,
              title: "Competitive Advantage",
              description: "Students who can prove AI proficiency will stand out in applications",
              parentConcern: "Addresses: 'Will this help my child get into college?'"
            },
            {
              icon: Brain,
              title: "Real Skill Development",
              description: "Learning to collaborate with AI, not depend on it",
              parentConcern: "Addresses: 'Is my child actually learning?'"
            }
          ],
          cta: "Give your child the skills they'll need for the AI-enabled future - responsibly.",
          urgency: "Early adopters will have 2-3 years advantage when institutions catch up"
        };

      case 'students':
        return {
          headline: "Prove You Can Use AI to Make Businesses Better",
          subheadline: "Turn your AI usage into professional advantages for college and career",
          keyPoints: [
            {
              icon: Target,
              title: "College Application Edge",
              description: "Demonstrate AI proficiency when most students can't",
              parentConcern: "Why it matters: Elite universities value AI literacy"
            },
            {
              icon: Star,
              title: "Career Readiness",
              description: "Employers actively seek candidates who can work with AI",
              parentConcern: "Why it matters: AI skills are the new digital literacy"
            },
            {
              icon: Brain,
              title: "Authentic Voice Preservation",
              description: "Improve your writing while staying true to yourself",
              parentConcern: "Why it matters: Authenticity + AI skills = powerful combination"
            }
          ],
          cta: "Build the portfolio that proves you're ready for the AI-enabled workforce",
          urgency: "First-mover advantage: Be AI-proficient before it becomes standard"
        };

      case 'counselors':
        return {
          headline: "Bridge the AI Education Gap",
          subheadline: "Help students use AI responsibly while building career-ready skills",
          keyPoints: [
            {
              icon: Shield,
              title: "Address Parent Concerns",
              description: "Show families how to encourage responsible AI use",
              parentConcern: "Solution: Transform worry into competitive advantage"
            },
            {
              icon: TrendingUp,
              title: "Student Differentiation",
              description: "Help students stand out with demonstrable AI proficiency",
              parentConcern: "Solution: Quantifiable skills for applications and interviews"
            },
            {
              icon: Clock,
              title: "Future-Focused Guidance",
              description: "Prepare students for an AI-enabled academic and work environment",
              parentConcern: "Solution: Proactive preparation vs reactive adaptation"
            }
          ],
          cta: "Position your students ahead of the curve with responsible AI education",
          urgency: "Early-adopting schools will see measurable advantages in college placement"
        };

      case 'institutions':
        return {
          headline: "Lead the Responsible AI Education Movement",
          subheadline: "Implement AI literacy that maintains academic integrity while building future-ready skills",
          keyPoints: [
            {
              icon: Shield,
              title: "Academic Integrity Preserved",
              description: "Complete transparency and similarity detection ensure authenticity",
              parentConcern: "Compliance: Meets ethical standards while building skills"
            },
            {
              icon: TrendingUp,
              title: "Measurable Outcomes",
              description: "Track student AI proficiency development with comprehensive analytics",
              parentConcern: "ROI: Quantifiable improvements in student readiness"
            },
            {
              icon: Brain,
              title: "Thought Leadership",
              description: "Position your institution as a pioneer in responsible AI education",
              parentConcern: "Reputation: Be recognized as forward-thinking and innovative"
            }
          ],
          cta: "Lead the transition to AI-enabled education while maintaining your values",
          urgency: "Early adopters will define best practices for the entire industry"
        };

      default:
        return {
          headline: "The Future of Education",
          subheadline: "AI-powered learning that maintains integrity",
          keyPoints: [],
          cta: "Learn more",
          urgency: ""
        };
    }
  };

  const messaging = getMessaging();

  return (
    <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl text-blue-900 mb-2">
          {messaging.headline}
        </CardTitle>
        <p className="text-blue-700 text-lg">{messaging.subheadline}</p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="grid gap-4">
          {messaging.keyPoints.map((point, index) => {
            const IconComponent = point.icon;
            return (
              <div key={index} className="flex items-start gap-3 p-4 bg-white rounded-lg border border-blue-100">
                <IconComponent className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1">{point.title}</h4>
                  <p className="text-gray-700 text-sm mb-2">{point.description}</p>
                  <p className="text-blue-600 text-xs font-medium">{point.parentConcern}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center space-y-4">
          <div className="bg-white p-4 rounded-lg border border-blue-200">
            <p className="text-gray-900 font-medium mb-2">{messaging.cta}</p>
            {messaging.urgency && (
              <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                <Clock className="w-3 h-3 mr-1" />
                {messaging.urgency}
              </Badge>
            )}
          </div>
          
          <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
            Get Started with StudentOS
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}