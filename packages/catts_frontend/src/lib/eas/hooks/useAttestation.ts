import { CHAIN_CONFIG } from "@/config";
import { useQuery } from "@tanstack/react-query";

export function useAttestation({
  chainId,
  uid,
}: {
  chainId?: number;
  uid?: string | null;
}) {
  return useQuery({
    queryKey: ["attestation", chainId, uid],
    queryFn: async () => {
      if (!chainId || !uid) return null;

      const operationName = "AttestationQuery";

      const query = `query AttestationQuery($where: AttestationWhereUniqueInput!) {
        attestation(where: $where) {
          data
        }
      }`;

      const variables = {
        where: {
          id: uid,
        },
      };

      const response = await fetch(CHAIN_CONFIG[chainId].easGraphQLUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          operationName,
          query,
          variables,
        }),
      });

      const json = await response.json();

      return json.data.attestation;
    },
  });
}
