import { EAS_CONFIG } from "../config";

export function getEasConfig(chainId?: number) {
  if (!chainId) {
    return undefined;
  }
  const easContractAddress = EAS_CONFIG.find((c) => c.id === chainId);
  if (!easContractAddress) {
    return undefined;
  }
  return easContractAddress;
}
