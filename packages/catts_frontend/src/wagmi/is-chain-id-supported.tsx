import { wagmiConfig } from "../config";

export function isChainIdSupported(id?: number) {
  return wagmiConfig.chains.find((c) => c.id === id) !== undefined;
}
