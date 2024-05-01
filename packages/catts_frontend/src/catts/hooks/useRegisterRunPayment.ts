import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Run } from "catts_engine/declarations/catts_engine.did";
import { useActor } from "../../ic/Actors";

export const useRegisterRunPayment = () => {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (run: Run) => {
      if (!actor) return null;
      const transactionHash = run.payment_transaction_hash[0];
      if (!transactionHash) {
        return null;
      }
      const result = await actor.run_register_payment(run.id, transactionHash);
      await queryClient.invalidateQueries({ queryKey: ["run_history"] });
      return result;
    },
  });
};
