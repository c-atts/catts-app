import RunsListItem from "./RunsListItem";
import { useListRuns } from "@/run/hooks/useListRuns";

export default function RunsList() {
  const { data, isPending } = useListRuns();

  if (isPending) {
    return <p>Loading...</p>;
  }

  if (!data) {
    return <p>No data</p>;
  }

  console.log(data);
  return (
    <ul>
      {data.map((run) => (
        <RunsListItem key={run.id} run={run} />
      ))}
    </ul>
  );
}
