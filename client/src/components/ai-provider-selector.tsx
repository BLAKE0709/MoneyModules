import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  Brain, 
  Settings, 
  Building, 
  Shield, 
  Zap, 
  CheckCircle2,
  AlertTriangle,
  Info
} from "lucide-react";

interface AIProviderSelectorProps {
  userRole?: 'student' | 'counselor' | 'admin';
  institutionId?: string;
  onProviderChange?: (config: any) => void;
}

export default function AIProviderSelector({ 
  userRole = 'student', 
  institutionId,
  onProviderChange 
}: AIProviderSelectorProps) {
  const [selectedProvider, setSelectedProvider] = useState('openai');
  const [customConfig, setCustomConfig] = useState({
    baseURL: '',
    apiKey: '',
    model: '',
    temperature: 0.7,
    maxTokens: 1500
  });
  const [showAdvanced, setShowAdvanced] = useState(false);

  const providers = [
    {
      id: 'openai',
      name: 'OpenAI GPT-4o',
      description: 'Industry-leading language model with excellent essay analysis',
      capabilities: ['JSON Mode', 'Vision', 'Function Calling'],
      icon: Brain,
      cost: 'Standard',
      recommended: userRole === 'student'
    },
    {
      id: 'anthropic',
      name: 'Anthropic Claude',
      description: 'Advanced reasoning and ethical AI responses',
      capabilities: ['Constitutional AI', 'Long Context', 'Code Analysis'],
      icon: Shield,
      cost: 'Premium',
      recommended: false
    },
    {
      id: 'google',
      name: 'Google Gemini',
      description: 'Multimodal AI with strong analytical capabilities',
      capabilities: ['Multimodal', 'Real-time', 'Code Generation'],
      icon: Zap,
      cost: 'Competitive',
      recommended: false
    },
    {
      id: 'azure',
      name: 'Azure OpenAI',
      description: 'Enterprise OpenAI with enhanced security and compliance',
      capabilities: ['Enterprise Security', 'Data Residency', 'SLA Guarantees'],
      icon: Building,
      cost: 'Enterprise',
      recommended: userRole === 'admin'
    },
    {
      id: 'custom',
      name: 'Institution LLM',
      description: 'Your university\'s custom AI model or endpoint',
      capabilities: ['Full Control', 'Data Privacy', 'Custom Training'],
      icon: Settings,
      cost: 'Variable',
      recommended: !!institutionId
    }
  ];

  const handleProviderSelect = (providerId: string) => {
    setSelectedProvider(providerId);
    
    const provider = providers.find(p => p.id === providerId);
    const config = {
      provider: providerId,
      model: getDefaultModel(providerId),
      temperature: customConfig.temperature,
      maxTokens: customConfig.maxTokens,
      ...(providerId === 'custom' && {
        baseURL: customConfig.baseURL,
        apiKey: customConfig.apiKey,
        model: customConfig.model
      })
    };
    
    onProviderChange?.(config);
  };

  const getDefaultModel = (providerId: string) => {
    const models = {
      openai: 'gpt-4o',
      anthropic: 'claude-sonnet-4-20250514',
      google: 'gemini-2.5-pro',
      azure: 'gpt-4',
      custom: customConfig.model || 'custom-model-v1'
    };
    return models[providerId as keyof typeof models];
  };

  const selectedProviderData = providers.find(p => p.id === selectedProvider);

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          AI Provider Configuration
        </h3>
        <p className="text-gray-600">
          {userRole === 'admin' 
            ? 'Configure AI provider for your institution'
            : 'Choose your preferred AI assistant'
          }
        </p>
      </div>

      {/* Provider Selection */}
      <div className="grid gap-4">
        {providers.map((provider) => {
          const IconComponent = provider.icon;
          const isSelected = selectedProvider === provider.id;
          
          return (
            <Card 
              key={provider.id}
              className={`cursor-pointer transition-all ${
                isSelected 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'hover:border-gray-300'
              }`}
              onClick={() => handleProviderSelect(provider.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <IconComponent className={`w-6 h-6 mt-1 ${
                      isSelected ? 'text-blue-600' : 'text-gray-600'
                    }`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900">{provider.name}</h4>
                        {provider.recommended && (
                          <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
                            Recommended
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{provider.description}</p>
                      <div className="flex flex-wrap gap-1">
                        {provider.capabilities.map((cap, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {cap}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="text-xs">
                      {provider.cost}
                    </Badge>
                    {isSelected && (
                      <CheckCircle2 className="w-5 h-5 text-blue-600 mt-2" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Custom Configuration */}
      {selectedProvider === 'custom' && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-900">
              <Settings className="w-5 h-5" />
              Custom AI Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="baseURL">API Endpoint URL</Label>
              <Input
                id="baseURL"
                placeholder="https://ai.youruniversity.edu/v1"
                value={customConfig.baseURL}
                onChange={(e) => setCustomConfig(prev => ({ ...prev, baseURL: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="model">Model Name</Label>
              <Input
                id="model"
                placeholder="university-llm-v1"
                value={customConfig.model}
                onChange={(e) => setCustomConfig(prev => ({ ...prev, model: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="apiKey">API Key (Optional)</Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="••••••••••••••••"
                value={customConfig.apiKey}
                onChange={(e) => setCustomConfig(prev => ({ ...prev, apiKey: e.target.value }))}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Advanced Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Advanced Settings</CardTitle>
            <Switch
              checked={showAdvanced}
              onCheckedChange={setShowAdvanced}
            />
          </div>
        </CardHeader>
        {showAdvanced && (
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="temperature">Temperature: {customConfig.temperature}</Label>
              <input
                id="temperature"
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={customConfig.temperature}
                onChange={(e) => setCustomConfig(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Focused</span>
                <span>Balanced</span>
                <span>Creative</span>
              </div>
            </div>
            <div>
              <Label htmlFor="maxTokens">Max Response Length</Label>
              <Select 
                value={customConfig.maxTokens.toString()}
                onValueChange={(value) => setCustomConfig(prev => ({ ...prev, maxTokens: parseInt(value) }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="500">Short (500 tokens)</SelectItem>
                  <SelectItem value="1500">Medium (1500 tokens)</SelectItem>
                  <SelectItem value="3000">Long (3000 tokens)</SelectItem>
                  <SelectItem value="5000">Very Long (5000 tokens)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Selected Provider Info */}
      {selectedProviderData && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900 mb-1">
                  Selected: {selectedProviderData.name}
                </h4>
                <p className="text-blue-800 text-sm">
                  {selectedProviderData.description}
                </p>
                {selectedProvider === 'custom' && (
                  <div className="mt-2 p-2 bg-white rounded border border-blue-200">
                    <p className="text-xs text-blue-700">
                      <strong>Note:</strong> Custom endpoints must be compatible with OpenAI API format.
                      Contact your IT administrator for configuration details.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Save Configuration */}
      {userRole === 'admin' && (
        <div className="flex justify-end">
          <Button 
            onClick={() => console.log('Save configuration')}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Save Institution Settings
          </Button>
        </div>
      )}
    </div>
  );
}