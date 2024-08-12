import { createLazyFileRoute } from "@tanstack/react-router";
import { RunContextProvider } from "@/run/RunContextProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import RunDetails from "@/components/routes/run/RunDetails";
import AttestationDetails from "@/components/routes/run/AttestationDetails";

export const Route = createLazyFileRoute("/run/$runId")({
  component: Index,
});

function Index() {
  const { runId } = Route.useParams();

  return (
    <RunContextProvider runId={runId}>
      <div className="flex gap-5 w-full">
        <div className="flex flex-col gap-5 w-3/4">
          <RunDetails />
          <AttestationDetails />
        </div>
        <div className="flex flex-col gap-5 w-1/4">
          <Card>
            <CardHeader>
              <CardTitle>About runs</CardTitle>
            </CardHeader>
            <CardContent>A run consists of …</CardContent>
          </Card>
        </div>
      </div>
    </RunContextProvider>
  );
}
