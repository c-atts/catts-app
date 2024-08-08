import { createLazyFileRoute } from "@tanstack/react-router";
import { useGetRunById } from "@/run/hooks/useGetRunById";

export const Route = createLazyFileRoute("/run/$runId")({
  component: Index,
});

function Index() {
  const { runId } = Route.useParams();
  const { data: run, isPending } = useGetRunById(runId);

  if (isPending) {
    return <div>Loading...</div>;
  }

  if (!run) {
    return <div>Run not found</div>;
  }

  return (
    <div className="flex gap-5">
      <div className="flex flex-col gap-5 w-2/3">{run.id}</div>
    </div>
  );
}
