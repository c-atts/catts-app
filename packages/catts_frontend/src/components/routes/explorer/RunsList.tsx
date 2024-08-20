import RunsListItem from "@/components/RunsListItem";
import { Skeleton } from "@/components/ui/skeleton";
import { useListRuns } from "@/run/hooks/useListRuns";
import { Link } from "@tanstack/react-router";

function RunsListSkeleton() {
  return (
    <div className="flex flex-col gap-5 pb-10">
      <h1>Latest runs</h1>
      <div className="flex flex-col gap-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton className="w-full h-[90px] rounded-lg" key={index} />
        ))}
      </div>
    </div>
  );
}

export default function RunsList() {
  const { data, isPending } = useListRuns({ page: 1, limit: 10 });

  if (isPending) {
    return <RunsListSkeleton />;
  }

  if (!data) {
    return null;
  }

  return (
    <div className="flex flex-col gap-5 pb-10">
      <h1>Latest runs</h1>
      {data.map((run) => (
        <RunsListItem key={run.id} run={run} />
      ))}
      <Link className="classic-link max-w-fit" search={{ page: 1 }} to="/runs">
        View all runs
      </Link>
    </div>
  );
}
