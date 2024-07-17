import { useMutation } from "@tanstack/react-query";

import { useActor } from "../../ic/ActorProvider";

export const useCreateUser = () => {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async () => {
      if (!actor) return null;
      return actor.user_create();
    },
  });
};
