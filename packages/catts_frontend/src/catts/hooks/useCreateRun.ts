import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useActor } from "../../ic/ActorProvider";

export const useCreateRun = () => {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      recipeId: recipeId,
      chainId,
    }: {
      recipeId: Uint8Array | number[];
      chainId: number | undefined;
    }) => {
      if (!actor || !chainId) return null;
      const result = await actor.run_create(recipeId, BigInt(chainId));
      await queryClient.invalidateQueries({ queryKey: ["run_history"] });
      return result;
    },
  });
};
