import RunsListItem from "./RunsListItem";
import { useListRuns } from "@/run/hooks/useListRuns";

export default function RunsList() {
  const { data, isPending } = useListRuns({ page: 1, limit: 10 });

  if (isPending) {
    return <p>Loading...</p>;
  }

  if (!data) {
    return <p>No data</p>;
  }

  return (
    <div className="flex flex-col gap-5">
      <h1>Latest runs</h1>
      {data.map((run) => (
        <RunsListItem key={run.id} run={run} />
      ))}
    </div>
  );
}
