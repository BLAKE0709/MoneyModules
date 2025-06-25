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
  AlertTriangle, 
  Zap,
  Clock,
  TrendingUp 
} from "lucide-react";
import AIProviderIndicator from "./ai-provider-indicator";

interface AIProviderStatusProps {
  userRole?: 'student' | 'counselor' | 'admin';
  institutionId?: string;
}

export default function AIProviderStatus({ userRole = 'student', institutionId }: AIProviderStatusProps) {
  // Mock data - would come from API in real implementation
  const providerStatus = {
    current: {
      provider: 'openai',
      model: 'gpt-4o',
      status: 'healthy',
      responseTime: 1.2,
      reliability: 99.8,
      costEfficiency: 85
    },
    alternatives: [
      { provider: 'anthropic', model: 'claude-sonnet-4', available: true, cost: 'higher' },
      { provider: 'google', model: 'gemini-2.5-pro', available: true, cost: 'lower' },
      { provider: 'azure', model: 'gpt-4', available: institutionId ? true : false, cost: 'enterprise' },
      { provider: 'custom', model: 'university-llm', available: institutionId ? true : false, cost: 'variable' }
    ],
    usage: {
      today: 47,
      thisWeek: 342,
      thisMonth: 1456,
      limit: 5000
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-100 text-green-800 border-green-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'error': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-blue-600" />
          AI Provider Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Provider */}
        <div className="bg-white rounded-lg p-4 border">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-gray-900">Active Provider</h4>
            <Badge className={getStatusColor(providerStatus.current.status)}>
              <CheckCircle2 className="w-3 h-3 mr-1" />
              {providerStatus.current.status}
            </Badge>
          </div>
          
          <div className="flex items-center gap-4 mb-4">
            <AIProviderIndicator 
              provider={providerStatus.current.provider}
              model={providerStatus.current.model}
              variant="detailed"
            />
          </div>

          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="text-lg font-semibold text-blue-600">
                {providerStatus.current.responseTime}s
              </div>
              <div className="text-gray-600">Response Time</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-green-600">
                {providerStatus.current.reliability}%
              </div>
              <div className="text-gray-600">Reliability</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-purple-600">
                {providerStatus.current.costEfficiency}%
              </div>
              <div className="text-gray-600">Efficiency</div>
            </div>
          </div>
        </div>

        {/* Usage Tracking */}
        <div className="bg-white rounded-lg p-4 border">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-gray-900">Usage This Month</h4>
            <Badge variant="outline">
              {((providerStatus.usage.thisMonth / providerStatus.usage.limit) * 100).toFixed(1)}% used
            </Badge>
          </div>
          
          <Progress 
            value={(providerStatus.usage.thisMonth / providerStatus.usage.limit) * 100} 
            className="mb-3"
          />
          
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <div className="font-medium text-gray-900">{providerStatus.usage.today}</div>
              <div className="text-gray-600">Today</div>
            </div>
            <div>
              <div className="font-medium text-gray-900">{providerStatus.usage.thisWeek}</div>
              <div className="text-gray-600">This Week</div>
            </div>
            <div>
              <div className="font-medium text-gray-900">{providerStatus.usage.thisMonth}</div>
              <div className="text-gray-600">This Month</div>
            </div>
          </div>
        </div>

        {/* Alternative Providers */}
        {userRole === 'admin' && (
          <div className="bg-white rounded-lg p-4 border">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900">Alternative Providers</h4>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-1" />
                Configure
              </Button>
            </div>
            
            <div className="space-y-2">
              {providerStatus.alternatives.map((alt, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded border-l-4 border-l-gray-200">
                  <div className="flex items-center gap-3">
                    <AIProviderIndicator 
                      provider={alt.provider}
                      model={alt.model}
                      variant="compact"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {alt.cost}
                    </Badge>
                    {alt.available ? (
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-yellow-600" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Provider Performance Trends */}
        <div className="bg-white rounded-lg p-4 border">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-gray-900">Performance Trends</h4>
            <TrendingUp className="w-4 h-4 text-green-600" />
          </div>
          
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Average Quality Score</span>
              <div className="flex items-center gap-2">
                <span className="font-medium">8.9/10</span>
                <Badge className="bg-green-100 text-green-800 text-xs">+0.3</Badge>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Student Satisfaction</span>
              <div className="flex items-center gap-2">
                <span className="font-medium">94%</span>
                <Badge className="bg-green-100 text-green-800 text-xs">+2%</Badge>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Cost per Analysis</span>
              <div className="flex items-center gap-2">
                <span className="font-medium">$0.12</span>
                <Badge className="bg-green-100 text-green-800 text-xs">-8%</Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        {userRole === 'admin' && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1">
              <Zap className="w-4 h-4 mr-1" />
              Test Provider
            </Button>
            <Button variant="outline" size="sm" className="flex-1">
              <Clock className="w-4 h-4 mr-1" />
              View Logs
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}