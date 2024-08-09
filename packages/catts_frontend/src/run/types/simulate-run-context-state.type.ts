import { RunOutput } from "./run-output.type";

export type SimulationStepStatus = "idle" | "pending" | "success" | "error";

export type SimulateRunContextStateType = {
  step1Fetching: SimulationStepStatus;
  step2Processing: SimulationStepStatus;
  step3Validating: SimulationStepStatus;
  errorMessage?: string;
  runOutput?: RunOutput;
};
