import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { 
  Home, 
  FileText, 
  DollarSign, 
  User, 
  Bell,
  Search,
  Plus
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface MobileNavigationProps {
  unreadNotifications?: number;
  upcomingDeadlines?: number;
}

export default function MobileNavigation({ 
  unreadNotifications = 0, 
  upcomingDeadlines = 0 
}: MobileNavigationProps) {
  const [location, setLocation] = useLocation();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Hide navigation on scroll down, show on scroll up
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const navItems = [
    {
      path: "/",
      icon: Home,
      label: "Home",
      badge: null
    },
    {
      path: "/essays",
      icon: FileText,
      label: "Essays",
      badge: null
    },
    {
      path: "/scholarships",
      icon: DollarSign,
      label: "Scholarships",
      badge: upcomingDeadlines > 0 ? upcomingDeadlines : null
    },
    {
      path: "/persona",
      icon: User,
      label: "Profile",
      badge: null
    }
  ];

  const quickActions = [
    {
      action: () => setLocation("/essays/new"),
      icon: Plus,
      label: "New Essay",
      color: "bg-blue-600"
    },
    {
      action: () => setLocation("/scholarships"),
      icon: Search,
      label: "Find Scholarships",
      color: "bg-green-600"
    }
  ];

  return (
    <>
      {/* Main Navigation Bar */}
      <div 
        className={`mobile-nav transition-transform duration-300 ${
          isVisible ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.path;
          
          return (
            <button
              key={item.path}
              onClick={() => setLocation(item.path)}
              className={`mobile-nav-item relative ${
                isActive 
                  ? 'text-blue-600 bg-blue-50' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {item.badge && (
                  <Badge 
                    className="absolute -top-2 -right-2 min-w-[18px] h-[18px] text-xs bg-red-500 text-white"
                  >
                    {item.badge}
                  </Badge>
                )}
              </div>
              <span>{item.label}</span>
            </button>
          );
        })}
        
        {/* Notifications */}
        <button
          onClick={() => setLocation("/notifications")}
          className="mobile-nav-item relative text-gray-600 hover:text-gray-900"
        >
          <div className="relative">
            <Bell className="w-5 h-5" />
            {unreadNotifications > 0 && (
              <Badge className="absolute -top-2 -right-2 min-w-[18px] h-[18px] text-xs bg-red-500 text-white">
                {unreadNotifications}
              </Badge>
            )}
          </div>
          <span>Alerts</span>
        </button>
      </div>

      {/* Quick Action Floating Buttons */}
      <div className="fixed bottom-20 right-4 z-40 flex flex-col gap-2 md:hidden">
        {quickActions.map((action, idx) => {
          const Icon = action.icon;
          
          return (
            <Button
              key={idx}
              onClick={action.action}
              className={`w-12 h-12 rounded-full shadow-lg ${action.color} hover:scale-105 transform transition-all duration-200`}
            >
              <Icon className="w-5 h-5 text-white" />
              <span className="sr-only">{action.label}</span>
            </Button>
          );
        })}
      </div>

      {/* Mobile spacing for fixed navigation */}
      <div className="h-16 md:hidden" />
    </>
  );
}