import { useActor } from "@/lib/ic/ActorProvider";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Run } from "catts_engine/declarations/catts_engine.did";

export const useRegisterRunPayment = () => {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ run, block }: { run: Run; block: bigint }) => {
      if (!actor) return null;
      const transactionHash = run.payment_transaction_hash[0];
      if (!transactionHash) {
        return null;
      }
      const result = await actor.run_register_payment(
        run.id,
        transactionHash,
        block,
      );
      await queryClient.invalidateQueries({ queryKey: ["run_history"] });
      return result;
    },
  });
};
