import { PlusCircleIcon } from "lucide-react";
import React, { useLayoutEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PopoverContent } from "@/components/ui/popover";

interface AddIssueTagPopoverProps {
  open?: boolean;
  onAddNew: (tag: {
    title: string;
    backgroundColor?: string;
    textColor?: string;
  }) => void;
}

export function AddIssueTagPopover({
  open,
  onAddNew,
  ...props
}: React.ComponentPropsWithoutRef<typeof PopoverContent> &
  AddIssueTagPopoverProps) {
  const [title, setTitle] = useState("");
  const [backgroundColor, setBackgroundColor] = useState("#E0E0E0");
  const [textColor, setTextColor] = useState("#000000");

  useLayoutEffect(() => {
    if (!open) {
      setTitle("");
      setBackgroundColor("#E0E0E0");
      setTextColor("#000000");
    }
  }, [open]);

  const handleAdd = () => {
    if (!title.trim()) {
      return;
    }

    onAddNew({
      title: title.trim(),
      backgroundColor,
      textColor,
    });

    // Reset form
    setTitle("");
    setBackgroundColor("#E0E0E0");
    setTextColor("#000000");
  };

  return (
    <PopoverContent {...props}>
      <div className="space-y-4">
        <h3 className="font-semibold">Dodaj nową etykietę</h3>

        <div className="space-y-3">
          <div className="grid gap-2">
            <Label htmlFor="newTagTitle">Nazwa</Label>
            <Input
              id="newTagTitle"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nazwa etykiety"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="newTagBackgroundColor">Kolor tła</Label>
            <Input
              id="newTagBackgroundColor"
              type="color"
              value={backgroundColor}
              onChange={(e) => setBackgroundColor(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="newTagTextColor">Kolor tekstu</Label>
            <Input
              id="newTagTextColor"
              type="color"
              value={textColor}
              onChange={(e) => setTextColor(e.target.value)}
            />
          </div>

          <Button
            type="button"
            onClick={handleAdd}
            disabled={!title.trim()}
            className="w-full"
          >
            <PlusCircleIcon className="mr-2" size={16} />
            Dodaj
          </Button>
        </div>
      </div>
    </PopoverContent>
  );
}
