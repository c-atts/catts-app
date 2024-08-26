import { ALCHEMY_API_KEY } from "@/config";
import { Alchemy } from "alchemy-sdk";
import { chainIdToNetwork } from "./chainIdToNetwork";

export async function getFeeData({ chainId }: { chainId: number }) {
  const alchemy = new Alchemy({
    apiKey: ALCHEMY_API_KEY,
    network: chainIdToNetwork(chainId),
  });
  return alchemy.core.getFeeData();
}
