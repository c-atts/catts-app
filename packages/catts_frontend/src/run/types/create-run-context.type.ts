import { CreateRunContextStateType } from "./create-run-context-state.type";
import { Run } from "catts_engine/declarations/catts_engine.did";

export type CreateRunContextType = CreateRunContextStateType & {
  initPayAndCreateAttestation: (recipeId: Uint8Array) => Promise<void>;
  payAndCreateAttestation: (run: Run) => Promise<void>;
  createAttestation: (run: Run, block: bigint) => Promise<void>;
  resetRun: () => void;
};
