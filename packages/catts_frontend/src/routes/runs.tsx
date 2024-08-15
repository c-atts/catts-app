import { createFileRoute } from "@tanstack/react-router";
import { useListRuns } from "@/run/hooks/useListRuns";
import { z } from "zod";
import RunsPagination from "@/components/routes/runs/RunsPagination";
import { useCountRuns } from "@/run/hooks/useCountRuns";
import RunsListItem from "@/components/RunsListItem";

const runSearchSchema = z.object({
  page: z.number().int().positive().optional().default(1),
});

export const Route = createFileRoute("/runs")({
  component: Index,
  validateSearch: (search: Record<string, unknown>) =>
    runSearchSchema.parse(search),
});

const LIMIT = 10;

function Index() {
  const { page } = Route.useSearch();

  const { data: runs } = useListRuns({ page, limit: LIMIT });
  const { data: count } = useCountRuns();

  if (!runs || !count) {
    return null;
  }

  return (
    <div className="w-full xl:w-[1280px] mb-10 bg-radial flex-grow px-5 xl:px-0">
      <h1>Runs</h1>
      <div className="flex flex-col gap-5">
        {runs?.map((run) => <RunsListItem key={run.id} run={run} />)}
      </div>
      <div className="m-5">
        <RunsPagination
          currentPage={page}
          totalPages={Math.ceil(count / LIMIT)}
        />
      </div>
    </div>
  );
}
