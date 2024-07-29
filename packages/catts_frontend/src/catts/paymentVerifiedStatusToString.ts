import { Run } from "catts_engine/declarations/catts_engine.did";
import { RunStatus } from "./types/run-status.type";
import { getRunStatus } from "./getRunStatus";

export const paymentVerifiedStatusToString = (run?: Run) => {
  if (!run) {
    return undefined;
  }

  switch (getRunStatus(run)) {
    case RunStatus.PaymentPending:
      return "Pending";
    case RunStatus.PaymentRegistered:
      return "Registered";
    case RunStatus.PaymentVerified:
      return "Verified";
  }

  if (run.error.length > 0) {
    return "Failed";
  }

  return undefined;
};
