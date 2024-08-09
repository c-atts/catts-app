import { RunOutput } from "./run-output.type";
import { SimulateRunContextStateType } from "./simulate-run-context-state.type";

export type SimulateRunContextType = SimulateRunContextStateType & {
  isSimulating: boolean;
  allStepsCompleted: boolean;
  resetSimulation(): void;
  startSimulation(address: string): Promise<RunOutput | undefined>;
};
