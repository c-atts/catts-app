import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useActor } from "../../ic/Actors";

export const useInitRun = () => {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (runId: string) => {
      if (!actor) return null;
      const result = await actor.init_run(runId);
      await queryClient.invalidateQueries({ queryKey: ["run_history"] });
      return result;
    },
  });
};
