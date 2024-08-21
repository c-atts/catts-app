import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function RevealDetails({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isRevealed, setIsRevealed] = useState(false);

  return (
    <div className="flex flex-col gap-5">
      {isRevealed && children}
      <div className="flex w-full justify-center">
        <Button onClick={() => setIsRevealed(!isRevealed)}>
          {isRevealed ? "Hide recipe details" : "Show recipe details"}
        </Button>
      </div>
    </div>
  );
}
