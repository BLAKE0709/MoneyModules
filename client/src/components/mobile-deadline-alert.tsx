import { useState, useEffect } from "react";
import { X, Clock, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface DeadlineAlert {
  id: string;
  scholarshipTitle: string;
  amount: number;
  deadline: Date;
  daysLeft: number;
  applicationUrl: string;
  matchScore: number;
}

interface MobileDeadlineAlertProps {
  alerts: DeadlineAlert[];
}

export default function MobileDeadlineAlert({ alerts }: MobileDeadlineAlertProps) {
  const [currentAlert, setCurrentAlert] = useState(0);
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  // Show alerts that haven't been dismissed and have urgent deadlines
  const urgentAlerts = alerts.filter(alert => 
    alert.daysLeft <= 7 && !dismissed.includes(alert.id)
  );

  useEffect(() => {
    if (urgentAlerts.length > 0) {
      setIsVisible(true);
      
      // Cycle through alerts every 5 seconds
      const interval = setInterval(() => {
        setCurrentAlert(prev => (prev + 1) % urgentAlerts.length);
      }, 5000);

      return () => clearInterval(interval);
    } else {
      setIsVisible(false);
    }
  }, [urgentAlerts.length]);

  const dismissAlert = (alertId: string) => {
    setDismissed(prev => [...prev, alertId]);
  };

  const dismissAllAlerts = () => {
    setDismissed(urgentAlerts.map(alert => alert.id));
  };

  if (!isVisible || urgentAlerts.length === 0) {
    return null;
  }

  const alert = urgentAlerts[currentAlert];
  const urgencyColor = alert.daysLeft <= 1 
    ? "bg-red-500" 
    : alert.daysLeft <= 3 
    ? "bg-orange-500" 
    : "bg-yellow-500";

  return (
    <div className={`deadline-alert-mobile ${urgencyColor} md:hidden`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 flex-shrink-0" />
            <span className="font-semibold text-sm truncate">
              {alert.daysLeft === 0 ? "Due Today!" : `${alert.daysLeft} days left`}
            </span>
            <Badge className="bg-white bg-opacity-20 text-white text-xs">
              {alert.matchScore}% match
            </Badge>
          </div>
          
          <h3 className="font-medium text-sm leading-tight mb-1 line-clamp-2">
            {alert.scholarshipTitle}
          </h3>
          
          <div className="flex items-center justify-between">
            <span className="text-sm opacity-90">
              ${alert.amount.toLocaleString()}
            </span>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="secondary"
                className="bg-white bg-opacity-20 text-white border-white border-opacity-30 hover:bg-opacity-30 text-xs px-2 py-1"
                onClick={() => window.open(alert.applicationUrl, '_blank')}
              >
                <ExternalLink className="w-3 h-3 mr-1" />
                Apply
              </Button>
            </div>
          </div>
        </div>
        
        <div className="flex items-start gap-1">
          {urgentAlerts.length > 1 && (
            <div className="flex gap-1 mt-1">
              {urgentAlerts.map((_, idx) => (
                <div
                  key={idx}
                  className={`w-1.5 h-1.5 rounded-full ${
                    idx === currentAlert ? 'bg-white' : 'bg-white bg-opacity-40'
                  }`}
                />
              ))}
            </div>
          )}
          
          <Button
            size="sm"
            variant="ghost"
            className="p-1 h-auto text-white hover:bg-white hover:bg-opacity-20"
            onClick={() => dismissAlert(alert.id)}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      {urgentAlerts.length > 1 && (
        <div className="mt-2 pt-2 border-t border-white border-opacity-20">
          <Button
            size="sm"
            variant="ghost"
            className="text-white text-xs hover:bg-white hover:bg-opacity-20 p-1 h-auto"
            onClick={dismissAllAlerts}
          >
            Dismiss all {urgentAlerts.length} alerts
          </Button>
        </div>
      )}
    </div>
  );
}