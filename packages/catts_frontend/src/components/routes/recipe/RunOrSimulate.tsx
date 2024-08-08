import { Card, CardContent, CardHeader } from "@/components/ui/card";
import SimulateDialog from "./SimulateDialog";

export default function RunOrSimulate() {
  return (
    <Card>
      <CardHeader>
        Run this recipe to create an attestation or simulate it to see the
        result without creating.
      </CardHeader>
      <CardContent>
        <SimulateDialog />
      </CardContent>
    </Card>
  );
}
