import { useState, useEffect } from "react";
import { Cloud, CloudOff, Check } from "lucide-react";

interface AutoSaveIndicatorProps {
  isLoading?: boolean;
  lastSaved?: Date;
  hasUnsavedChanges?: boolean;
}

export default function AutoSaveIndicator({ 
  isLoading = false, 
  lastSaved, 
  hasUnsavedChanges = false 
}: AutoSaveIndicatorProps) {
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
    if (!isLoading && !hasUnsavedChanges && lastSaved) {
      setShowSaved(true);
      const timer = setTimeout(() => setShowSaved(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isLoading, hasUnsavedChanges, lastSaved]);

  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-blue-600">
        <Cloud className="w-4 h-4 animate-pulse" />
        <span>Saving...</span>
      </div>
    );
  }

  if (hasUnsavedChanges) {
    return (
      <div className="flex items-center gap-2 text-sm text-yellow-600">
        <CloudOff className="w-4 h-4" />
        <span>Unsaved changes</span>
      </div>
    );
  }

  if (showSaved) {
    return (
      <div className="flex items-center gap-2 text-sm text-green-600 animate-fade-in">
        <Check className="w-4 h-4" />
        <span>Saved</span>
      </div>
    );
  }

  if (lastSaved) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Cloud className="w-4 h-4" />
        <span>Saved {getTimeAgo(lastSaved)}</span>
      </div>
    );
  }

  return null;
}