import { RunStatus } from "../../../declarations/backend/backend.did";

export function runStatusToString(status: RunStatus) {
  if ("Created" in status) {
    return "Created";
  }
  if ("Paid" in status) {
    return "Paid";
  }
  if ("Cancelled" in status) {
    return "Cancelled";
  }
  if ("Completed" in status) {
    return "Completed";
  }
  if ("Failed" in status) {
    return "Failed";
  }
  return "Unknown";
}
