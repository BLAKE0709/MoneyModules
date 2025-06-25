import { Badge } from "@/components/ui/badge";
import { Brain, Building, Star, Target, Settings } from "lucide-react";

interface AIProviderIndicatorProps {
  provider?: string;
  model?: string;
  variant?: 'default' | 'compact' | 'detailed';
}

export default function AIProviderIndicator({ 
  provider, 
  model, 
  variant = 'default' 
}: AIProviderIndicatorProps) {
  if (!provider) return null;

  const getProviderInfo = (provider: string) => {
    const providers = {
      openai: { name: 'OpenAI', icon: Brain, color: 'bg-blue-100 text-blue-800 border-blue-200' },
      anthropic: { name: 'Anthropic', icon: Building, color: 'bg-orange-100 text-orange-800 border-orange-200' },
      google: { name: 'Google', icon: Star, color: 'bg-green-100 text-green-800 border-green-200' },
      azure: { name: 'Azure', icon: Target, color: 'bg-purple-100 text-purple-800 border-purple-200' },
      custom: { name: 'Custom', icon: Settings, color: 'bg-gray-100 text-gray-800 border-gray-200' }
    };
    return providers[provider as keyof typeof providers] || providers.custom;
  };

  const providerInfo = getProviderInfo(provider);
  const IconComponent = providerInfo.icon;

  if (variant === 'compact') {
    return (
      <Badge variant="outline" className={`text-xs ${providerInfo.color}`}>
        <IconComponent className="w-3 h-3 mr-1" />
        {providerInfo.name}
      </Badge>
    );
  }

  if (variant === 'detailed') {
    return (
      <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${providerInfo.color}`}>
        <IconComponent className="w-4 h-4" />
        <span className="font-medium">{providerInfo.name}</span>
        {model && (
          <>
            <span className="text-xs opacity-70">•</span>
            <span className="text-xs opacity-90">{model}</span>
          </>
        )}
      </div>
    );
  }

  return (
    <Badge variant="outline" className={`${providerInfo.color}`}>
      <IconComponent className="w-3 h-3 mr-1" />
      {providerInfo.name}
      {model && ` • ${model}`}
    </Badge>
  );
}