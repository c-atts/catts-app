import { RunContext } from "./RunContextProvider";
import { RunContextType } from "./run-context.type";
import { useContext } from "react";

export default function useRunContext(): RunContextType {
  const context = useContext(RunContext);
  if (!context) {
    throw new Error("useRunContext must be used within an RunContextProvider");
  }
  return context;
}
