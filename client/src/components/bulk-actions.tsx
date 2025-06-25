import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { 
  Trash2, 
  Download, 
  Tag, 
  Archive, 
  CheckSquare,
  Square
} from "lucide-react";

interface BulkActionsProps {
  items: Array<{ id: string; title?: string; originalName?: string }>;
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  onDelete?: (ids: string[]) => void;
  onDownload?: (ids: string[]) => void;
  onTag?: (ids: string[]) => void;
  onArchive?: (ids: string[]) => void;
}

export default function BulkActions({
  items,
  selectedIds,
  onSelectionChange,
  onDelete,
  onDownload,
  onTag,
  onArchive
}: BulkActionsProps) {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const isAllSelected = items.length > 0 && selectedIds.length === items.length;
  const isPartiallySelected = selectedIds.length > 0 && selectedIds.length < items.length;

  const handleSelectAll = () => {
    if (isAllSelected) {
      onSelectionChange([]);
    } else {
      onSelectionChange(items.map(item => item.id));
    }
  };

  const handleBulkAction = async (action: () => void, actionName: string) => {
    if (selectedIds.length === 0) {
      toast({
        title: "No items selected",
        description: "Please select items to perform this action",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      await action();
      toast({
        title: `${actionName} completed`,
        description: `${selectedIds.length} item(s) processed successfully`,
      });
      onSelectionChange([]);
    } catch (error) {
      toast({
        title: `${actionName} failed`,
        description: "Please try again or contact support",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0) return null;

  return (
    <div className="flex items-center gap-4 p-4 bg-gray-50 border rounded-lg">
      <div className="flex items-center gap-3">
        <Checkbox
          checked={isAllSelected}
          ref={(el) => {
            if (el) el.indeterminate = isPartiallySelected;
          }}
          onCheckedChange={handleSelectAll}
        />
        <span className="text-sm text-gray-600">
          {selectedIds.length === 0 
            ? `Select items (${items.length} total)`
            : `${selectedIds.length} of ${items.length} selected`
          }
        </span>
      </div>

      {selectedIds.length > 0 && (
        <div className="flex items-center gap-2 ml-auto">
          {onDownload && (
            <Button
              variant="outline"
              size="sm"
              disabled={isProcessing}
              onClick={() => handleBulkAction(() => onDownload(selectedIds), "Download")}
            >
              <Download className="w-4 h-4 mr-1" />
              Download
            </Button>
          )}

          {onTag && (
            <Button
              variant="outline"
              size="sm"
              disabled={isProcessing}
              onClick={() => handleBulkAction(() => onTag(selectedIds), "Tag")}
            >
              <Tag className="w-4 h-4 mr-1" />
              Tag
            </Button>
          )}

          {onArchive && (
            <Button
              variant="outline"
              size="sm"
              disabled={isProcessing}
              onClick={() => handleBulkAction(() => onArchive(selectedIds), "Archive")}
            >
              <Archive className="w-4 h-4 mr-1" />
              Archive
            </Button>
          )}

          {onDelete && (
            <Button
              variant="destructive"
              size="sm"
              disabled={isProcessing}
              onClick={() => handleBulkAction(() => onDelete(selectedIds), "Delete")}
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Delete ({selectedIds.length})
            </Button>
          )}
        </div>
      )}
    </div>
  );
}