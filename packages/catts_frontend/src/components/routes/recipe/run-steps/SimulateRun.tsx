import { LoaderCircle } from "lucide-react";
import useSimulateRunContext from "@/run/hooks/useSimulateRunContext";

export default function SimulateRun() {
  const {
    step1Fetching,
    step2Processing,
    step3Validating,
    allStepsCompleted,
    errorMessage,
    isSimulating,
  } = useSimulateRunContext();

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="items-center justify-center hidden w-8 h-8 text-xl font-bold rounded-full md:flex bg-primary text-primary-foreground">
            1
          </div>
          Simulate run
        </div>
        {isSimulating && step1Fetching === "pending" && !errorMessage && (
          <div className="flex justify-between w-full pl-10">
            <div>Fetching recipe data...</div>
            <div>
              <LoaderCircle className="w-5 h-5 animate-spin" />
            </div>
          </div>
        )}
        {isSimulating && step2Processing === "pending" && !errorMessage && (
          <div className="flex justify-between w-full pl-10">
            <div>Processing data...</div>
            <div>
              <LoaderCircle className="w-5 h-5 animate-spin" />
            </div>
          </div>
        )}
        {isSimulating && step3Validating === "pending" && !errorMessage && (
          <div className="flex justify-between w-full pl-10">
            <div>Validating data...</div>
            <div>
              <LoaderCircle className="w-5 h-5 animate-spin" />
            </div>
          </div>
        )}
        {errorMessage && (
          <div className="flex justify-between w-full pl-10">
            <div>Error: {errorMessage}</div>
            <div>🔴</div>
          </div>
        )}
        {allStepsCompleted && (
          <div className="flex justify-between w-full pl-10">
            <div>Simulation succeeded</div>
            <div>✅</div>
          </div>
        )}
      </div>
    </div>
  );
}
