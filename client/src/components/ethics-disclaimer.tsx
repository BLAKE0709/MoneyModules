import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertTriangle, Shield, CheckCircle2, Eye, Users } from "lucide-react";

interface EthicsDisclaimerProps {
  similarity?: number;
  aiGenerated?: boolean;
  showParentalConsent?: boolean;
  onConsentChange?: (granted: boolean) => void;
}

export default function EthicsDisclaimer({ 
  similarity = 0, 
  aiGenerated = false, 
  showParentalConsent = false,
  onConsentChange 
}: EthicsDisclaimerProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [parentalConsent, setParentalConsent] = useState(false);

  const handleConsentChange = (granted: boolean) => {
    setParentalConsent(granted);
    onConsentChange?.(granted);
  };

  const getSimilarityStatus = () => {
    if (similarity > 25) return { level: 'high', color: 'bg-red-500', text: 'High similarity detected' };
    if (similarity > 15) return { level: 'medium', color: 'bg-yellow-500', text: 'Moderate similarity' };
    return { level: 'low', color: 'bg-green-500', text: 'Original content' };
  };

  const similarityStatus = getSimilarityStatus();

  return (
    <div className="space-y-3">
      {/* AI Generation Notice */}
      {aiGenerated && (
        <Alert className="border-blue-200 bg-blue-50">
          <Shield className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <div className="flex items-center justify-between">
              <span>This content was generated with AI assistance.</span>
              <Badge variant="outline" className="text-blue-600 border-blue-300">
                AI-Assisted
              </Badge>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Similarity Check */}
      <Alert className={similarity > 25 ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}>
        <Eye className="h-4 w-4" />
        <AlertDescription>
          <div className="flex items-center justify-between">
            <span>Content originality: {100 - similarity}%</span>
            <Badge className={`${similarityStatus.color} text-white text-xs`}>
              {similarityStatus.text}
            </Badge>
          </div>
          {similarity > 25 && (
            <p className="text-red-700 text-sm mt-2">
              Content exceeds similarity threshold. Please revise for originality.
            </p>
          )}
        </AlertDescription>
      </Alert>

      {/* Parental Consent */}
      {showParentalConsent && (
        <Alert className="border-purple-200 bg-purple-50">
          <Users className="h-4 w-4 text-purple-600" />
          <AlertDescription className="text-purple-800">
            <div className="flex items-center justify-between">
              <span>Parental oversight recommended for AI features</span>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant={parentalConsent ? "default" : "outline"}
                  onClick={() => handleConsentChange(true)}
                  className="text-xs"
                >
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Approved
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowDetails(true)}
                  className="text-xs"
                >
                  Details
                </Button>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Ethics Guidelines */}
      <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded-lg">
        <div className="flex items-start gap-2">
          <AlertTriangle className="w-3 h-3 text-gray-500 mt-0.5" />
          <div>
            <p className="font-medium mb-1">Responsible AI Use Guidelines:</p>
            <ul className="space-y-1 text-gray-600">
              <li>• Use AI as a collaborative tool, not a replacement for original thinking</li>
              <li>• Always review and personalize AI-generated content</li>
              <li>• Maintain academic integrity in all submissions</li>
              <li>• Build genuine AI proficiency for career readiness</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>AI Ethics & Safety Framework</DialogTitle>
            <DialogDescription>
              StudentOS promotes responsible AI use that builds real professional advantages
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Our Commitment</h4>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• 25% similarity cap ensures original thinking</li>
                <li>• Prompt and response auditing for transparency</li>
                <li>• Parental oversight controls for younger students</li>
                <li>• Focus on skill building, not shortcut taking</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Student Benefits</h4>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• Demonstrable AI proficiency for college applications</li>
                <li>• Professional skill development for career readiness</li>
                <li>• Ethical AI usage patterns that impress employers</li>
                <li>• Competitive advantage in AI-enabled workforce</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Technical Safeguards</h4>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• HTTPS encryption and secure data handling</li>
                <li>• Row-level security for student privacy</li>
                <li>• Audit trails for all AI interactions</li>
                <li>• Performance monitoring and quality assurance</li>
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}