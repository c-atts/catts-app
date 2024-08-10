import { Run } from "catts_engine/declarations/catts_engine.did";

export type CreateRunContextStateType = {
  inProgress: boolean;
  runCreated: boolean;
  runInProgress?: Run;
  errorMessage?: string;
};
