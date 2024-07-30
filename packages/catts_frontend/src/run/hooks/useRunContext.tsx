import { useContext } from "react";
import { RunContextType } from "../types/run-context.type";
import { RunContext } from "../RunContextProvider";

export default function useRunContext(): RunContextType {
  const context = useContext(RunContext);
  if (!context) {
    throw new Error("useRunContext must be used within an RunContextProvider");
  }
  return context;
}
