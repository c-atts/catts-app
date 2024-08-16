import { LoaderCircle } from "lucide-react";
import { useSelector } from "@xstate/store/react";
import { runStateStore } from "@/run/RunStateStore";

export default function SimulateRun() {
  const {
    simulateFetchStatus,
    simulateProcessStatus,
    simulateValidateStatus,
    errorMessage,
  } = useSelector(runStateStore, (state) => state.context);

  const allStepsCompleted =
    simulateFetchStatus === "success" &&
    simulateProcessStatus === "success" &&
    simulateValidateStatus === "success";

  const anySimulateError =
    simulateFetchStatus === "error" ||
    simulateProcessStatus === "error" ||
    simulateValidateStatus === "error";

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="items-center justify-center  w-8 h-8 text-xl font-bold rounded-full flex bg-primary text-primary-foreground">
            2
          </div>
          Simulate run
        </div>
        {simulateFetchStatus === "pending" && !errorMessage && (
          <div className="flex justify-between w-full pl-10">
            <div>Fetching recipe data...</div>
            <div>
              <LoaderCircle className="w-5 h-5 animate-spin" />
            </div>
          </div>
        )}
        {simulateProcessStatus === "pending" && !errorMessage && (
          <div className="flex justify-between w-full pl-10">
            <div>Processing data...</div>
            <div>
              <LoaderCircle className="w-5 h-5 animate-spin" />
            </div>
          </div>
        )}
        {simulateValidateStatus === "pending" && !errorMessage && (
          <div className="flex justify-between w-full pl-10">
            <div>Validating data...</div>
            <div>
              <LoaderCircle className="w-5 h-5 animate-spin" />
            </div>
          </div>
        )}
        {anySimulateError && errorMessage && (
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
