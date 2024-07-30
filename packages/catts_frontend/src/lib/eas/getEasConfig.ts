import { EAS_CONFIG } from "@/config";

export function getEasConfig(chain_id?: number) {
  if (!chain_id) {
    return undefined;
  }
  const easContractAddress = EAS_CONFIG.find((c) => c.id === chain_id);
  if (!easContractAddress) {
    return undefined;
  }
  return easContractAddress;
}
