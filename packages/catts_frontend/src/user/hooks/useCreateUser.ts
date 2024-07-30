import { useActor } from "@/lib/ic/ActorProvider";
import { useMutation } from "@tanstack/react-query";

export const useCreateUser = () => {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async () => {
      if (!actor) return null;
      return actor.user_create();
    },
  });
};
