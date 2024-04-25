import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useActor } from "../../ic/Actors";

export const useCancelRun = () => {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (runId: Uint8Array | number[]) => {
      if (!actor) return null;
      const result = await actor.cancel_run(runId);
      await queryClient.invalidateQueries({ queryKey: ["run_history"] });
      return result;
    },
  });
};
