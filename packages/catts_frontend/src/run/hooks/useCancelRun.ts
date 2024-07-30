import { useActor } from "@/lib/ic/ActorProvider";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useCancelRun = () => {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (runId: Uint8Array | number[]) => {
      if (!actor) return null;
      const result = await actor.run_cancel(runId);
      await queryClient.invalidateQueries({ queryKey: ["run_history"] });
      return result;
    },
  });
};
