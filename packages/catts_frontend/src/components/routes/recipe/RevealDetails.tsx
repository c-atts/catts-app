import { Button } from "@/components/ui/button";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { useState } from "react";

export default function RevealDetails({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isRevealed, setIsRevealed] = useState(false);

  return (
    <div className="flex flex-col gap-5 mt-6">
      <div className="flex w-full justify-center">
        <Button onClick={() => setIsRevealed(!isRevealed)}>
          {isRevealed ? "Hide recipe details" : "Show recipe details"}
          {isRevealed ? (
            <ChevronUpIcon className="ml-2 w-4 h-4" />
          ) : (
            <ChevronDownIcon className="ml-2 w-4 h-4" />
          )}
        </Button>
      </div>
      {isRevealed && children}
    </div>
  );
}
