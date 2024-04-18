import { ReactNode, createContext, useEffect, useState } from "react";
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";

import { RunContextStateType } from "./run-context-state.type";
import { RunContextType } from "./run-context.type";
import { useInitRun } from "../catts/hooks/useInitRun";
import { useStartRun } from "../catts/hooks/useStartRun";

export const RunContext = createContext<RunContextType | undefined>(undefined);

export function RunContextProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<RunContextStateType>();

  const _useInitRun = useInitRun();
  const _startRun = useStartRun();
  const _writeContract = useWriteContract();
  const _useWaitForTransactionReceipt = useWaitForTransactionReceipt({
    hash: _writeContract.data,
    confirmations: 1,
  });

  // Reset isSelectedRecipeValid when selectedRecipe changes
  useEffect(() => {
    setState((s) => {
      return {
        ...s,
        isSelectedRecipeValid: undefined,
      };
    });
  }, [state?.selectedRecipe]);

  return (
    <RunContext.Provider
      value={{
        selectedRecipe: state?.selectedRecipe,
        setSelectedRecipe: (recipe) =>
          setState({ ...state, selectedRecipe: recipe }),
        isSelectedRecipeValid: state?.isSelectedRecipeValid,
        setIsSelectedRecipeValid: (isValid) =>
          setState({ ...state, isSelectedRecipeValid: isValid }),
        useInitRun: _useInitRun,
        useStartRun: _startRun,
        useWriteContract: _writeContract,
        useWaitForTransactionReceipt: _useWaitForTransactionReceipt,
      }}
    >
      {children}
    </RunContext.Provider>
  );
}
