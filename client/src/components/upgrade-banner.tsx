import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, Crown, X } from "lucide-react";
import PricingModal from "./pricing-modal";

interface UpgradeBannerProps {
  feature?: string;
  context?: 'essay-limit' | 'ai-portfolio' | 'premium-scholarships' | 'general';
}

export default function UpgradeBanner({ feature, context = 'general' }: UpgradeBannerProps) {
  const [showPricing, setShowPricing] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const getContextMessage = () => {
    switch (context) {
      case 'essay-limit':
        return {
          title: "Essay Limit Reached",
          description: "Upgrade to Pro for unlimited essay analysis and AI-powered improvements",
          cta: "Unlock Unlimited Essays"
        };
      case 'ai-portfolio':
        return {
          title: "AI Portfolio Premium Feature",
          description: "Transform your ChatGPT conversations into a professional skill portfolio",
          cta: "Generate AI Portfolio"
        };
      case 'premium-scholarships':
        return {
          title: "Premium Scholarship Database",
          description: "Access exclusive scholarships worth $200k+ with AI-powered matching",
          cta: "Access Premium Scholarships"
        };
      default:
        return {
          title: "Unlock Your Full Potential",
          description: "Upgrade to StudentOS Pro for unlimited access to all AI-powered features",
          cta: "Upgrade to Pro"
        };
    }
  };

  const { title, description, cta } = getContextMessage();

  return (
    <>
      <Alert className="border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50 mb-6">
        <Zap className="h-4 w-4 text-blue-600" />
        <AlertDescription>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-blue-900">{title}</span>
                <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
                  <Crown className="w-3 h-3 mr-1" />
                  Pro
                </Badge>
              </div>
              <p className="text-blue-800 text-sm">{description}</p>
            </div>
            <div className="flex items-center gap-2 ml-4">
              <Button
                onClick={() => setShowPricing(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                size="sm"
              >
                <Zap className="w-3 h-3 mr-2" />
                {cta}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDismissed(true)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </AlertDescription>
      </Alert>

      <PricingModal
        open={showPricing}
        onOpenChange={setShowPricing}
        initialTab="student"
      />
    </>
  );
}