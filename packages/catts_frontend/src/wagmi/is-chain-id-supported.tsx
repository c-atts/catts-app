import { allowedChains } from "../config";

export function isChainIdSupported(id?: number | undefined) {
  if (!id) return false;
  return allowedChains.includes(id);
}
