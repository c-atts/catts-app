import { Run } from "catts_engine/declarations/catts_engine.did";
import { RunStatus } from "./types/run-status.type";

export function getRunStatus(run: Run | undefined): RunStatus {
  if (!run) {
    return RunStatus.NotStarted;
  }
  if (run.attestation_uid.length > 0) {
    return RunStatus.AttestationUidConfirmed;
  }
  if (run.attestation_transaction_hash.length > 0) {
    return RunStatus.AttestationCreated;
  }
  if (run.payment_log_index.length > 0) {
    return RunStatus.PaymentVerified;
  }
  if (run.payment_transaction_hash.length > 0) {
    return RunStatus.PaymentRegistered;
  }
  return RunStatus.PaymentPending;
}
