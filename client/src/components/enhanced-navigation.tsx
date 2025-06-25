import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, PenTool, Target, Bot, ExternalLink } from "lucide-react";

interface EnhancedNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function EnhancedNavigation({ activeTab, onTabChange }: EnhancedNavigationProps) {
  const navItems = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: '🏠',
      agent: null
    },
    { 
      id: 'essays', 
      label: 'Essay Polish', 
      icon: '📝',
      agent: { name: 'EssayPolish Pro', icon: PenTool, active: true }
    },
    { 
      id: 'writing-repository', 
      label: 'Writing Repository', 
      icon: '📚',
      agent: { name: 'PersonaLearning', icon: Brain, active: true }
    },
    { 
      id: 'persona', 
      label: 'My Profile', 
      icon: '👤',
      agent: { name: 'PersonaLearning', icon: Brain, active: true }
    }
  ];

  return (
    <nav className="-mb-px flex space-x-8">
      {navItems.map((item) => {
        const isActive = activeTab === item.id;
        const AgentIcon = item.agent?.icon;
        
        return (
          <button
            key={item.id}
            className={`group relative py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              isActive
                ? "border-primary text-primary"
                : "border-transparent text-neutral-500 hover:text-neutral-700"
            }`}
            onClick={() => onTabChange(item.id)}
          >
            <div className="flex items-center gap-2">
              <span>{item.icon}</span>
              <span>{item.label}</span>
              {item.agent?.active && (
                <div className="flex items-center">
                  {AgentIcon && <AgentIcon className="w-3 h-3 text-blue-600" />}
                  <div className="w-2 h-2 bg-green-500 rounded-full ml-1 animate-pulse" />
                </div>
              )}
            </div>
            
            {item.agent?.active && (
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                  {item.agent.name} Active
                </div>
              </div>
            )}
          </button>
        );
      })}
      
      {/* AI Agents Link */}
      <a
        href="/agents"
        className="py-2 px-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-sm font-medium hover:from-blue-700 hover:to-purple-700 transition-all flex items-center gap-2"
      >
        <Bot className="w-4 h-4" />
        AI Agents
        <ExternalLink className="w-3 h-3" />
      </a>
    </nav>
  );
}