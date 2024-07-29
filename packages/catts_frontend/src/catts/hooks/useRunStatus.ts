import { Run } from "catts_engine/declarations/catts_engine.did";
import { RunStatus } from "../types/run-status.type";
import { getRunStatus } from "../getRunStatus";

export function useRunStatus(run: Run | undefined): RunStatus {
  return getRunStatus(run);
}
