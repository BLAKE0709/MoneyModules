import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface ToastWithActionProps {
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
  variant?: "default" | "destructive";
}

export function showToastWithAction({
  title,
  description,
  actionLabel,
  onAction,
  variant = "default"
}: ToastWithActionProps) {
  const { toast } = useToast();
  
  return toast({
    title,
    description,
    variant,
    action: (
      <Button
        variant="outline"
        size="sm"
        onClick={onAction}
      >
        {actionLabel}
      </Button>
    ),
  });
}