import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface KeyboardShortcutsProps {
  onSearch?: () => void;
  onNewEssay?: () => void;
  onNewSample?: () => void;
}

export default function KeyboardShortcuts({ 
  onSearch, 
  onNewEssay, 
  onNewSample 
}: KeyboardShortcutsProps) {
  const { toast } = useToast();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Command/Ctrl + K for search
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        if (onSearch) {
          onSearch();
        } else {
          // Focus search input if available
          const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
          if (searchInput) {
            searchInput.focus();
            searchInput.select();
          }
        }
      }

      // Command/Ctrl + N for new essay
      if ((event.metaKey || event.ctrlKey) && event.key === 'n') {
        event.preventDefault();
        if (onNewEssay) {
          onNewEssay();
          toast({
            title: "New Essay",
            description: "Creating a new essay draft",
          });
        }
      }

      // Command/Ctrl + U for upload
      if ((event.metaKey || event.ctrlKey) && event.key === 'u') {
        event.preventDefault();
        if (onNewSample) {
          onNewSample();
          toast({
            title: "Upload Sample",
            description: "Opening file upload dialog",
          });
        }
      }

      // Show shortcuts help with Command/Ctrl + ?
      if ((event.metaKey || event.ctrlKey) && event.key === '/') {
        event.preventDefault();
        toast({
          title: "Keyboard Shortcuts",
          description: "⌘K Search • ⌘N New Essay • ⌘U Upload • ESC Close",
        });
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onSearch, onNewEssay, onNewSample, toast]);

  return null;
}