import { runStateStore } from "@/run/RunStateStore";
import { wait } from "@/lib/util/wait";

const POLL_SCHEMA_CREATED_DELAY = 1000;
const POLL_SCHEMA_CREATED_ATTEMPTS = 180; // 3 minutes

export async function createSchemaFlow() {
  runStateStore.send({
    type: "transition",
    step: "createSchemaStatus",
    status: "pending",
  });

  for (let i = 0; i < POLL_SCHEMA_CREATED_ATTEMPTS; i++) {
    await wait(POLL_SCHEMA_CREATED_DELAY);
    const snapshot = runStateStore.getSnapshot();
    if (snapshot.context.createSchemaStatus === "success") {
      runStateStore.send({
        type: "clearErrorMessage",
      });
      return true;
    }
  }

  runStateStore.send({
    type: "setError",
    step: "createSchemaStatus",
    message: "Schema creation timed out",
  });

  return false;
}
