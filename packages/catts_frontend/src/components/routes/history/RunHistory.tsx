import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";
import { useSiweIdentity } from "ic-use-siwe-identity";
import { RunHistoryListItem } from "./RunHistoryListItem";
import { Section } from "@/components/ui/Section";
import { useListUserRuns } from "@/run/hooks/useListUserRuns";

export function RunHistoryInner() {
  const { identity } = useSiweIdentity();
  const { data, isPending } = useListUserRuns();

  if (!identity) {
    return <Section>Sign in to view your run history.</Section>;
  }

  if (isPending) {
    return (
      <div className="w-full justify-center flex pt-10">
        <FontAwesomeIcon className="mr-2" icon={faCircleNotch} size="2x" spin />
      </div>
    );
  }

  if (!data) {
    return <Section>Load error.</Section>;
  }

  if ("Err" in data) {
    return <Section>Error: {data.Err.message}</Section>;
  }

  if (!Array.isArray(data.Ok) || data.Ok.length === 0) {
    return <Section>You have not run any recipes yet.</Section>;
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
    <div className="w-[750px]">
      <RunHistoryInner />
    </div>
  );
}
