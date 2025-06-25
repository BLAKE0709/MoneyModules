import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calculator, Crown, Code, Brain, ExternalLink } from "lucide-react";

export default function PlatformIntegrationPreview() {
  return (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950 rounded-lg p-6 mb-8">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Platform Integration Hub
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Connect your learning platforms to create powerful college application portfolios
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="border-purple-200 bg-purple-50 dark:bg-purple-900">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Crown className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium">Chess.com</span>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <Badge variant="outline" className="text-xs">Strategic Thinking</Badge>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50 dark:bg-green-900">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium">Khan Academy</span>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <Badge variant="outline" className="text-xs">Math Skills</Badge>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-900">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Code className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium">Codecademy</span>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <Badge variant="outline" className="text-xs">Programming</Badge>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50 dark:bg-orange-900">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-orange-600" />
              <span className="text-sm font-medium">AI Usage</span>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <Badge variant="outline" className="text-xs">Ethics Portfolio</Badge>
          </CardContent>
        </Card>
      </div>

      <div className="text-center">
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          Transform 500+ hours of chess into "Strategic Thinking Portfolio" • Document math progression • Show ethical AI use
        </p>
        <Button asChild className="bg-purple-600 hover:bg-purple-700">
          <a href="/integrations">
            <ExternalLink className="w-4 h-4 mr-2" />
            Explore Platform Hub
          </a>
        </Button>
      </div>
    </div>
  );
}