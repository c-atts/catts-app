import { SchemaItem } from "@ethereum-attestation-service/eas-sdk";
import { createStore } from "@xstate/store";
import { useSelector } from "@xstate/store/react";
import { Run } from "catts_engine/declarations/catts_engine.did";

export type RunStepStatus = "idle" | "pending" | "success" | "error";

type RunContext = {
  loadSchemaStatus: RunStepStatus;
  createSchemaStatus: RunStepStatus;
  simulateFetchStatus: RunStepStatus;
  simulateProcessStatus: RunStepStatus;
  simulateValidateStatus: RunStepStatus;
  createRunStatus: RunStepStatus;
  payStatus: RunStepStatus;
  createAttestationStatus: RunStepStatus;
  errorMessage?: string;
  runInProgress?: Run;
  attestationData?: SchemaItem[];
};

const initialState: RunContext = {
  loadSchemaStatus: "idle",
  createSchemaStatus: "idle",
  simulateFetchStatus: "idle",
  simulateProcessStatus: "idle",
  simulateValidateStatus: "idle",
  createRunStatus: "idle",
  payStatus: "idle",
  createAttestationStatus: "idle",
  errorMessage: undefined,
  runInProgress: undefined,
  attestationData: undefined,
};

type KeysOfType<T, V> = {
  [K in keyof T]-?: T[K] extends V ? K : never;
}[keyof T];

export type RunStep = KeysOfType<RunContext, RunStepStatus>;

export const runStateStore = createStore(initialState, {
  reset: () => initialState,
  transition: (context, event: { step: RunStep; status: RunStepStatus }) => {
    context[event.step] = event.status;
    return context;
  },
  transitionMany: (
    context,
    event: { steps: Array<{ step: RunStep; status: RunStepStatus }> },
  ) => {
    for (const e of event.steps) {
      context[e.step] = e.status;
    }
    return context;
  },
  setError: (context, event: { step: RunStep; message: string }) => {
    context[event.step] = "error";
    context.errorMessage = event.message;
    return context;
  },
  clearErrorMessage: (context) => {
    context.errorMessage = undefined;
    return context;
  },
  setRunInProgress: (context, event: { run: Run }) => {
    context.runInProgress = event.run;
    return context;
  },
  setAttestationData: (context, event: { schemaItems: SchemaItem[] }) => {
    context.attestationData = event.schemaItems;
    return context;
  },
});

export function useIsSimulating() {
  return useSelector(runStateStore, (state) => {
    const {
      simulateFetchStatus,
      simulateProcessStatus,
      simulateValidateStatus,
    } = state.context;
    return (
      simulateFetchStatus === "pending" ||
      simulateProcessStatus === "pending" ||
      simulateValidateStatus === "pending"
    );
  });
}

export function useIsSimulationCompleted() {
  return useSelector(runStateStore, (state) => {
    const {
      simulateFetchStatus,
      simulateProcessStatus,
      simulateValidateStatus,
    } = state.context;
    return (
      simulateFetchStatus === "success" &&
      simulateProcessStatus === "success" &&
      simulateValidateStatus === "success"
    );
  });
}

export function useIsInProgress() {
  return useSelector(runStateStore, (state) => {
    const {
      loadSchemaStatus,
      simulateFetchStatus,
      simulateProcessStatus,
      simulateValidateStatus,
      createRunStatus,
      payStatus,
      createAttestationStatus,
    } = state.context;
    return (
      loadSchemaStatus === "pending" ||
      simulateFetchStatus === "pending" ||
      simulateProcessStatus === "pending" ||
      simulateValidateStatus === "pending" ||
      createRunStatus === "pending" ||
      payStatus === "pending" ||
      createAttestationStatus === "pending"
    );
  });
}
