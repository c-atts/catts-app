import { cn } from "@/lib/utils";

type MessageType = "note" | "tip" | "important" | "warning" | "caution";

export default function Message({
  type,
  children,
  className,
}: {
  type: MessageType;
  children: React.ReactNode;
  className?: string;
}) {
  let colors = "";
  switch (type) {
    case "warning": {
      colors = "bg-yellow-100/50 border-yellow-300";
      break;
    }
    case "note": {
      colors = "bg-blue-100/50 border-blue-300";
      break;
    }
  }

  return (
    <div className={cn(colors, "p-4 rounded-md border-[1px]", className)}>
      {children}
    </div>
  );
}
