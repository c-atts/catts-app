import { Run } from "catts_engine/declarations/catts_engine.did";

export type RunContextStateType = {
  inProgress: boolean;
  runInProgress?: Run;
  errorMessage?: string;
};
