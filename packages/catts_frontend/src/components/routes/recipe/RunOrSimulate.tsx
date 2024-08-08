import { Card, CardContent, CardHeader } from "@/components/ui/card";
import SimulateDialog from "./SimulateDialog";
import RunDialog from "./RunDialog";
import { RunContextProvider } from "@/run/RunContextProvider";

export default function RunOrSimulate() {
  return (
    <Card>
      <CardHeader>
        Run this recipe to create an attestation or simulate it to see the
        result without creating.
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <SimulateDialog />
        <RunContextProvider>
          <RunDialog />
        </RunContextProvider>
      </CardContent>
    </Card>
  );
}
