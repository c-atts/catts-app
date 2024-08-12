import { useEas } from "./useEas";
import { useQuery } from "@tanstack/react-query";

export function useAttestation({
  chainId,
  uid,
}: {
  chainId?: number;
  uid?: string | null;
}) {
  const eas = useEas(chainId);

  return useQuery({
    queryKey: ["attestation", uid],
    queryFn: async () => {
      if (!eas || !uid) return null;
      return await eas.getAttestation(uid);
    },
  });
}
