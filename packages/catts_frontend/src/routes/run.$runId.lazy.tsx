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
      <div className="flex gap-5 w-[1250px] mb-10">
        <div className="flex flex-col gap-5 w-2/3">
          <RunDetails />
          <AttestationDetails />
        </div>
        <div className="flex flex-col gap-5 w-1/3">
          <Card>
            <CardHeader>
              <CardTitle>About runs</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              Running a recipe means creating an attestation based on the
              queries and processing logic in that recipe.
              <p>A recipe can be run on any chain supported by C–ATTS.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </RunContextProvider>
  );
}
