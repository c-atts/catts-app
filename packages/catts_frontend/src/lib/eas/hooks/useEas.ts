import { CHAIN_CONFIG } from "@/config";
import { useEthersSigner } from "@/lib/ethers/hooks/useEthersSigner";
import { EAS } from "@ethereum-attestation-service/eas-sdk";

export function useEas(chainId?: number) {
  const signer = useEthersSigner({ chainId });
  if (!chainId || !signer) {
    return null;
  }
  const easContractAddress = CHAIN_CONFIG[chainId].easContractAddress;
  const eas = new EAS(easContractAddress);
  eas.connect(signer);
  return eas;
}
