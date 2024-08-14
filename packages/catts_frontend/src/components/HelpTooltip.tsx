import { CircleHelp } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

export default function HelpTooltip({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <CircleHelp className="w-4 h-4 mx-1 text-muted-foreground/50 -mb-[2px]" />
        </TooltipTrigger>
        <TooltipContent className="text-sm max-w-xs flex flex-col gap-2 p-3">
          {children}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
