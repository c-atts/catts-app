import { Run } from "catts_engine/declarations/catts_engine.did";
import { RunStatus } from "./types/run-status.type";
import { getRunStatus } from "./getRunStatus";

export const getRunStatusString = (run?: Run) => {
  switch (getRunStatus(run)) {
    case RunStatus.AttestationUidConfirmed:
      return "Attestation UID Confirmed";
    case RunStatus.AttestationCreated:
      return "Attestation Created";
    case RunStatus.PaymentVerified:
      return "Payment Verified";
    case RunStatus.PaymentRegistered:
      return "Payment Registered";
    case RunStatus.PaymentPending:
      return "Payment Pending";
    default:
      return "Not Started";
  }
};
