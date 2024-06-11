import { catts_engine } from "catts_engine/declarations";
import { useQuery } from "@tanstack/react-query";

export const useGetRecipeBySlug = (recipeSlug: string) => {
  return useQuery({
    queryKey: ["recipe_by_slug", recipeSlug],
    queryFn: async () => {
      return catts_engine.recipe_get_by_slug(recipeSlug);
    },
  });
};
