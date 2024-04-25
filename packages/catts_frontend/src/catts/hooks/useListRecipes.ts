import { catts_engine } from "catts_engine/declarations";
import { useQuery } from "@tanstack/react-query";

export const useListRecipes = () => {
  return useQuery({
    queryKey: ["recipes"],
    queryFn: async () => {
      return catts_engine.list_recipes();
    },
  });
};
