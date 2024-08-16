import { useMutation } from "@tanstack/react-query";
import { CHAIN_CONFIG } from "@/config";
import { useAccount } from "wagmi";
import { SchemaRegistry } from "@ethereum-attestation-service/eas-sdk";
import { useEthersSigner } from "@/lib/ethers/hooks/useEthersSigner";

export function useCreateSchema({
  schema,
  onSuccess,
}: {
  schema?: string;
  onSuccess?: (data: string | null, variables: void, context: unknown) => void;
}) {
  const { chainId } = useAccount();
  const signer = useEthersSigner();
  return useMutation({
    mutationFn: async () => {
      if (!chainId || !schema || !signer) {
        return null;
      }

      // await wait(500);

      const schemaRegistry = new SchemaRegistry(
        CHAIN_CONFIG[chainId].easRegistryAddress,
        {
          signer,
        },
      );

      const resolverAddress = "0x0000000000000000000000000000000000000000";
      const revocable = false;

      const transaction = await schemaRegistry.register({
        schema:
          "uint8 chainID,string claimID,bool attestMinterIdentity,string comment",
        resolverAddress,
        revocable,
      });

      return transaction.wait();
    },
    onSuccess(data, variables, context) {
      if (onSuccess) {
        onSuccess(data, variables, context);
      }
    },
  });
}
