import { ReactNode, createContext } from "react";
import { RunContextType } from "./types/run-context.type";

export const RunContext = createContext<RunContextType | undefined>(undefined);

export function RunContextProvider({
  children,
  runId,
}: {
  children: ReactNode;
  runId: string;
}) {
  return (
    <RunContext.Provider
      value={{
        runId,
      }}
    >
      {children}
    </RunContext.Provider>
  );
}
