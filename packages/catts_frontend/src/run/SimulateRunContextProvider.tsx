import { ReactNode, createContext, useState } from "react";
import { SimulateRunContextType } from "./types/simulate-run-context.type";
import { SimulateRunContextStateType } from "./types/simulate-run-context-state.type";
import { fetchRecipeQueries } from "@/recipe/fetchRecipeQueries";
import { runProcessor } from "./runProcessor";
import { validateProcessorResult, validateSchemaItems } from "catts-sdk";
import { RunOutput } from "./types/run-output.type";
import useRecipeContext from "@/recipe/hooks/useRecipeContext";
import { errorWithMessage } from "@/lib/types/catts-error";

export const SimulateRunContext = createContext<
  SimulateRunContextType | undefined
>(undefined);

export function SimulateRunContextProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [state, setState] = useState<SimulateRunContextStateType>({
    step1Fetching: "idle",
    step2Processing: "idle",
    step3Validating: "idle",
    errorMessage: undefined,
    runOutput: undefined,
  });

  const { recipe } = useRecipeContext();

  async function resetSimulation() {
    setState({
      step1Fetching: "idle",
      step2Processing: "idle",
      step3Validating: "idle",
      errorMessage: undefined,
      runOutput: undefined,
    });
  }

  async function startSimulation(
    address: string,
  ): Promise<RunOutput | undefined> {
    if (!recipe) return;

    setState((prevState) => ({
      ...prevState,
      step1Fetching: "pending",
      step2Processing: "idle",
      step3Validating: "idle",
    }));

    const queryData = await fetchRecipeQueries(recipe, address);

    if (!queryData) {
      handleError(
        new Error("Recipe queries didn't return any data"),
        "step1Fetching",
      );
      return;
    }

    await delay(500);

    setState((prevState) => ({
      ...prevState,
      step1Fetching: "success",
      step2Processing: "pending",
    }));

    let runOutputRaw = "";
    let runOutput: RunOutput | undefined = undefined;

    try {
      const result = await runProcessor({ recipe, queryData });
      runOutputRaw = result.runOutputRaw;
      runOutput = result.runOutput;
    } catch (e) {
      handleError(e, "step2Processing");
      return;
    }

    await delay(500);

    setState((prevState) => ({
      ...prevState,
      step2Processing: "success",
      step3Validating: "pending",
      runOutput,
    }));

    try {
      const schemaItems = await validateProcessorResult({
        processorResult: runOutputRaw,
      });
      await validateSchemaItems({ schemaItems, schema: recipe.schema });
    } catch (e) {
      handleError(e, "step3Validating", "Couldn't validate output");
    }

    await delay(500);

    setState((prevState) => ({
      ...prevState,
      step3Validating: "success",
    }));

    return runOutput;
  }

  function handleError(
    error: unknown,
    step: keyof SimulateRunContextStateType,
    defaultMessage?: string,
  ) {
    console.error(error);
    const { success, data } = errorWithMessage.safeParse(error);
    setState((prevState) => ({
      ...prevState,
      [step]: "error",
      errorMessage:
        defaultMessage || (success ? data.message : "Unknown error"),
    }));
  }

  const isSimulating = [
    state.step1Fetching,
    state.step2Processing,
    state.step3Validating,
  ].some((step) => step === "pending");

  const allStepsCompleted = [
    state.step1Fetching,
    state.step2Processing,
    state.step3Validating,
  ].every((step) => step === "success");

  function delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  return (
    <SimulateRunContext.Provider
      value={{
        ...state,
        resetSimulation,
        startSimulation,
        isSimulating,
        allStepsCompleted,
      }}
    >
      {children}
    </SimulateRunContext.Provider>
  );
}
