import RunsListItem from "@/components/RunsListItem";
import { useListRuns } from "@/run/hooks/useListRuns";
import { Link } from "@tanstack/react-router";

export default function RunsList() {
  const { data } = useListRuns({ page: 1, limit: 10 });

  if (!data) {
    return null;
  }

  return (
    <div className="flex flex-col gap-5">
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
