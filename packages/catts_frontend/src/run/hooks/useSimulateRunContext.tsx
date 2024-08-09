import { useContext } from "react";
import { SimulateRunContextType } from "../types/simulate-run-context.type";
import { SimulateRunContext } from "../SimulateRunContextProvider";

export default function useSimulateRunContext(): SimulateRunContextType {
  const context = useContext(SimulateRunContext);
  if (!context) {
    throw new Error(
      "useSimulateRunContext must be used within an SimulateRunContextProvider",
    );
  }
  return context;
}
