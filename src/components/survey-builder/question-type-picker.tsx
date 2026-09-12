"use client";

import { questionTypeList, type QuestionType } from "@/lib/question-types";
import { useT } from "@/lib/i18n/provider";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "@/components/icons";

export function QuestionTypePicker({ onPick }: { onPick: (type: QuestionType) => void }) {
  const t = useT();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button variant="outline" className="gap-1.5">
          <PlusIcon className="h-4 w-4" />
          {t("wizard.addQuestion")}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="grid w-64 grid-cols-2 gap-0.5 p-1.5">
        {questionTypeList.map((qt) => (
          <DropdownMenuItem key={qt.type} onClick={() => onPick(qt.type)} className="text-xs">
            {t(`builder.${qt.labelKey}`)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
