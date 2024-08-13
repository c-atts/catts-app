import { runStateStore, RunStep } from "@/run/RunStateStore";

export function handleError(error: unknown, step: RunStep, message: string) {
  if (typeof error !== "undefined") {
    console.error(error);
  }
  runStateStore.send({
    type: "setError",
    step,
    message,
  });
}
