import { Run } from "catts_engine/declarations/catts_engine.did";
import { RunContextStateType } from "./run-context-state.type";

export type RunContextType = RunContextStateType & {
  initPayAndCreateAttestation: (recipeId: Uint8Array) => Promise<void>;
  payAndCreateAttestation: (run: Run) => Promise<void>;
  createAttestation: (run: Run, block: bigint) => Promise<void>;
  resetRun: () => void;
};
