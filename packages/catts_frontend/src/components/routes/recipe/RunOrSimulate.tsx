import { Card, CardContent, CardHeader } from "@/components/ui/card";

import { CreateRunContextProvider } from "@/run/CreateRunContextProvider";
import RunDialog from "./RunDialog";
import SimulateDialog from "./SimulateDialog";

export default function RunOrSimulate() {
  return (
    <Card>
      <CardHeader>
        Run this recipe to create an attestation or simulate it to see the
        result without creating.
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <SimulateDialog />
        <CreateRunContextProvider>
          <RunDialog />
        </CreateRunContextProvider>
      </CardContent>
    </Card>
  );
}
