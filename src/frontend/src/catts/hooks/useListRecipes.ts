import { useActor } from "../../ic/Actors";
import { useQuery } from "@tanstack/react-query";

export const useListRecipes = () => {
  const { actor } = useActor();
  return useQuery({
    queryKey: ["recipes"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.list_recipes();
    },
  });
};
