import { cn } from "@/lib/utils";

export default function ListCard({
  children,
  className,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "p-6 rounded-lg border bg-card text-card-foreground shadow-sm text-sm",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
