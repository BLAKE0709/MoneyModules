import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";
import { ArrowRight, Brain, FileText, Trophy, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg border border-white/20">
                <Brain className="w-6 h-6 text-blue-600" />
                <span className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  StudentOS
                </span>
                <Badge variant="secondary" className="ml-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                  AI-Powered
                </Badge>
              </div>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
              Your AI-Powered
              <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Educational Journey
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
              Transform your academic potential with intelligent essay polishing, scholarship discovery, 
              and personalized learning powered by advanced AI agents working together for your success.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Link href="/dashboard">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
                  Get Started
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/scholarships">
                <Button variant="outline" size="lg" className="border-2 border-gray-300 hover:border-purple-500 px-8 py-4 rounded-xl font-semibold">
                  Explore Scholarships
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <Link href="/essays">
            <Card className="group hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer bg-white/80 backdrop-blur-sm border border-white/20">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <FileText className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Essay Polish</h3>
                <p className="text-gray-600 mb-4">AI-powered essay enhancement that preserves your authentic voice while improving clarity and impact.</p>
                <Badge className="bg-blue-100 text-blue-700">Available Now</Badge>
              </CardContent>
            </Card>
          </Link>

          <Link href="/scholarships">
            <Card className="group hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer bg-white/80 backdrop-blur-sm border border-white/20">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Trophy className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Scholarship Scout</h3>
                <p className="text-gray-600 mb-4">Discover $200K+ in scholarship opportunities with AI matching based on your unique profile.</p>
                <Badge className="bg-purple-100 text-purple-700">9 Active Scholarships</Badge>
              </CardContent>
            </Card>
          </Link>

          <Link href="/ai-portfolio">
            <Card className="group hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer bg-white/80 backdrop-blur-sm border border-white/20">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Brain className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">AI Portfolio</h3>
                <p className="text-gray-600 mb-4">Transform your AI interactions into professional skills that impress colleges and employers.</p>
                <Badge className="bg-indigo-100 text-indigo-700">Patent Pending</Badge>
              </CardContent>
            </Card>
          </Link>

          <Link href="/university-integrations">
            <Card className="group hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer bg-white/80 backdrop-blur-sm border border-white/20">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">University Hub</h3>
                <p className="text-gray-600 mb-4">Agent-to-agent communication protocols connecting you directly with university admissions systems.</p>
                <Badge className="bg-emerald-100 text-emerald-700">Innovation Leader</Badge>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      {/* Welcome Message for Authenticated Users */}
      {user && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
          <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">
                Welcome back, {user.firstName || user.email}!
              </h2>
              <p className="text-blue-100 mb-6">
                Your AI agents are ready to help you achieve your educational goals. 
                Continue where you left off or explore new opportunities.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/dashboard">
                  <Button variant="secondary" className="bg-white text-blue-600 hover:bg-blue-50">
                    Go to Dashboard
                  </Button>
                </Link>
                <Link href="/persona">
                  <Button variant="outline" className="border-white text-white hover:bg-white/10">
                    Complete Profile
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}