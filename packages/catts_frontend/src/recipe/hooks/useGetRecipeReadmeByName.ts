import { useQuery } from "@tanstack/react-query";
import { catts_engine } from "catts_engine/declarations";

export const useGetRecipeReadmeByName = (name?: string) => {
  return useQuery({
    queryKey: ["recipe", "readme", "by_name", name],
    queryFn: async () => {
      if (!name) return null;
      const result = await catts_engine.recipe_get_readme_by_name(name);
      if (result) {
        if ("Ok" in result) {
          return result.Ok;
        }
        if ("Err" in result) {
          console.error(result.Err);
        }
      }
      return null;
    },
  });
};
