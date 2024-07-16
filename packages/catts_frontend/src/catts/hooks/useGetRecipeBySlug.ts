import { catts_engine } from "catts_engine/declarations";
import { useQuery } from "@tanstack/react-query";

export const useGetRecipeByName = (recipeName: string) => {
  return useQuery({
    queryKey: ["recipe_by_name", recipeName],
    queryFn: async () => {
      return catts_engine.recipe_get_by_name(recipeName);
    },
  });
};
