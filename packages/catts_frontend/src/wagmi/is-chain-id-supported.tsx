import { allowedChains } from "../config";

export function isChainIdSupported(id?: number) {
  if (!id) return false;
  return allowedChains.includes(id);
}
