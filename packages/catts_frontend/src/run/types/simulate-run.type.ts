export type SimulationStepStatus = "idle" | "pending" | "success" | "error";

export type SimulationSteps = {
  step1Fetching: SimulationStepStatus;
  step2Processing: SimulationStepStatus;
  step3Validating: SimulationStepStatus;
};
