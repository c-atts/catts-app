import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { CreateRunContextProvider } from "@/run/CreateRunContextProvider";
import RunDialog from "./RunDialog";
import SimulateDialog from "./SimulateDialog";
import { SimulateRunContextProvider } from "@/run/SimulateRunContextProvider";

export default function RunOrSimulate() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create attestation</CardTitle>
        <CardDescription>
          Run this recipe to create an attestation or simulate it to see the
          result without creating.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <SimulateRunContextProvider>
          <SimulateDialog />
          <CreateRunContextProvider>
            <RunDialog />
          </CreateRunContextProvider>
        </SimulateRunContextProvider>
      </CardContent>
    </Card>
  );
}
