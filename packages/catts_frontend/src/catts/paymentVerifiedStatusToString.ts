import { Run } from "catts_engine/declarations/catts_engine.did";

export const paymentVerifiedStatusToString = (run?: Run) => {
  if (!run) {
    return undefined;
  }

  const status = run.payment_verified_status[0];

  if (!status) {
    return undefined;
  }

  if ("VerificationFailed" in status) {
    return "Failed";
  }

  if ("Verified" in status) {
    return "Verified";
  }

  if ("Pending" in status) {
    return "Pending";
  }
};
