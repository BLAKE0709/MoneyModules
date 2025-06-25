import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Check, Zap, Building, Users, Crown } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface PricingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialTab?: 'student' | 'school';
}

export default function PricingModal({ open, onOpenChange, initialTab = 'student' }: PricingModalProps) {
  const [activeTab, setActiveTab] = useState<'student' | 'school'>(initialTab);
  const [annualBilling, setAnnualBilling] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const createSubscription = useMutation({
    mutationFn: async ({ priceId, planName }: { priceId: string; planName: string }) => {
      const response = await apiRequest('POST', '/api/create-subscription', { priceId, planName });
      return response;
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: () => {
      toast({
        title: "Subscription Error",
        description: "Failed to create subscription. Please try again.",
        variant: "destructive",
      });
    },
  });

  const studentPlans = [
    {
      name: "Basic",
      price: 0,
      priceId: null,
      popular: false,
      features: [
        "Basic essay analysis",
        "Up to 3 essays per month",
        "Core scholarship matching",
        "Student persona profile"
      ]
    },
    {
      name: "Pro",
      price: annualBilling ? 190 : 19,
      billing: annualBilling ? "per year" : "per month",
      priceId: annualBilling ? "price_student_pro_annual" : "price_student_pro_monthly",
      popular: true,
      features: [
        "Unlimited essay analysis",
        "AI usage portfolio generation",
        "Premium scholarship database ($200k+)",
        "Advanced writing insights",
        "College readiness scoring",
        "Priority support"
      ]
    }
  ];

  const schoolPlans = [
    {
      name: "Starter",
      price: 299,
      billing: "per month",
      priceId: "price_school_starter",
      studentLimit: "100 students",
      popular: false,
      features: [
        "Up to 100 students",
        "Basic analytics dashboard",
        "Counselor portal access",
        "Student progress tracking",
        "Email support"
      ]
    },
    {
      name: "Professional",
      price: 899,
      billing: "per month",
      priceId: "price_school_professional",
      studentLimit: "500 students",
      popular: true,
      features: [
        "Up to 500 students",
        "Advanced analytics & reporting",
        "Custom branding",
        "API access",
        "Priority support",
        "Training sessions"
      ]
    },
    {
      name: "Enterprise",
      price: 2499,
      billing: "per month",
      priceId: "price_school_enterprise",
      studentLimit: "Unlimited",
      popular: false,
      features: [
        "Unlimited students",
        "White-label deployment",
        "Custom integrations",
        "Dedicated success manager",
        "SLA guarantees",
        "Advanced security features"
      ]
    }
  ];

  const handleSubscribe = (priceId: string | null, planName: string) => {
    if (!priceId) {
      toast({
        title: "Already Active",
        description: "You're already using the basic plan!",
      });
      return;
    }
    
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to subscribe",
        variant: "destructive",
      });
      return;
    }

    createSubscription.mutate({ priceId, planName });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Choose Your StudentOS Plan
          </DialogTitle>
          <DialogDescription className="text-center">
            Transform AI usage into professional advantages for college and career readiness
          </DialogDescription>
        </DialogHeader>

        {/* Tab Navigation */}
        <div className="flex items-center justify-center mb-6">
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
            <Button
              variant={activeTab === 'student' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('student')}
              className="flex items-center gap-2"
            >
              <Users className="w-4 h-4" />
              Students
            </Button>
            <Button
              variant={activeTab === 'school' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('school')}
              className="flex items-center gap-2"
            >
              <Building className="w-4 h-4" />
              Schools
            </Button>
          </div>
        </div>

        {/* Annual Billing Toggle (Students Only) */}
        {activeTab === 'student' && (
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className={!annualBilling ? 'font-medium' : 'text-gray-500'}>Monthly</span>
            <Switch
              checked={annualBilling}
              onCheckedChange={setAnnualBilling}
            />
            <span className={annualBilling ? 'font-medium' : 'text-gray-500'}>
              Annual
              <Badge className="ml-2 bg-green-100 text-green-800 border-0">Save 17%</Badge>
            </span>
          </div>
        )}

        {/* Pricing Cards */}
        <div className={`grid gap-6 ${activeTab === 'student' ? 'md:grid-cols-2' : 'md:grid-cols-3'}`}>
          {(activeTab === 'student' ? studentPlans : schoolPlans).map((plan, index) => (
            <Card key={index} className={`relative ${plan.popular ? 'border-blue-500 shadow-lg' : ''}`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-500 text-white px-4 py-1">
                    <Crown className="w-3 h-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center">
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-3xl font-bold">${plan.price}</span>
                  <span className="text-gray-600 ml-1">
                    {plan.billing || (plan.price === 0 ? 'free forever' : '')}
                  </span>
                </div>
                {activeTab === 'school' && (
                  <p className="text-sm text-gray-600 mt-2">{plan.studentLimit}</p>
                )}
              </CardHeader>
              
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button
                  onClick={() => handleSubscribe(plan.priceId, plan.name)}
                  disabled={createSubscription.isPending}
                  className={`w-full ${plan.popular ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                  variant={plan.popular ? 'default' : 'outline'}
                >
                  {createSubscription.isPending ? (
                    "Processing..."
                  ) : plan.price === 0 ? (
                    "Current Plan"
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Get Started
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Value Proposition */}
        <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
          <h3 className="font-semibold text-lg mb-3 text-center">
            Why StudentOS is Essential for College Success
          </h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="font-medium text-blue-600 mb-1">Prove AI Proficiency</div>
              <p className="text-gray-600">Transform ChatGPT usage into demonstrable professional skills</p>
            </div>
            <div className="text-center">
              <div className="font-medium text-purple-600 mb-1">Voice-Preserving Polish</div>
              <p className="text-gray-600">Improve essays while maintaining authentic student voice</p>
            </div>
            <div className="text-center">
              <div className="font-medium text-green-600 mb-1">$200k+ Scholarships</div>
              <p className="text-gray-600">AI-powered matching to relevant scholarship opportunities</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}