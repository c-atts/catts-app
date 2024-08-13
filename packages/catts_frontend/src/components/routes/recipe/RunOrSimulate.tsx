import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import RunDialog from "./RunDialog";
import SimulateDialog from "./SimulateDialog";

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
        <SimulateDialog />
        <RunDialog />
      </CardContent>
    </Card>
  );
}
