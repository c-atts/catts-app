import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { RunHistoryListItem } from "./RunHistoryListItem";
import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";
import { useGetRunHistory } from "../../../catts/hooks/useGetRunHistory";
import { useSiweIdentity } from "ic-use-siwe-identity";

export function RunHistoryInner() {
  const { identity } = useSiweIdentity();
  const { data, isPending } = useGetRunHistory();

  if (!identity) {
    return <p>Sign in to view your run history.</p>;
  }

  if (isPending) {
    return (
      <p>
        <FontAwesomeIcon className="mr-2" icon={faCircleNotch} spin />
        Loading run history
      </p>
    );
  }

  if (!data) {
    return <p>No data</p>;
  }

  if ("Err" in data) {
    return <p>Error: {data.Err}</p>;
  }

  if (!Array.isArray(data.Ok) || data.Ok.length === 0) {
    return <p>You have not run any recipes yet.</p>;
  }

  // Sorting the runs by the 'created' timestamp, newest first using BigInt comparison
  const sortedRuns = data.Ok.sort((a, b) => {
    // Use BigInt for comparison directly
    return Number(b.created - a.created);
  });

  return (
    <ul>
      {sortedRuns.map((run) => (
        <RunHistoryListItem key={run.id.toString()} run={run} />
      ))}
    </ul>
  );
}

export default function RunHistory() {
  return (
    <div>
      <h2 className="text-theme-400">Run History</h2>
      <RunHistoryInner />
    </div>
  );
}