import { catts_engine } from "catts_engine/declarations";
import { useQuery } from "@tanstack/react-query";

export const useGetRecipe = (recipeId: Uint8Array | number[]) => {
  return useQuery({
    queryKey: ["recipe", recipeId],
    queryFn: async () => {
      return catts_engine.get_recipe(recipeId);
    },
  });
};
