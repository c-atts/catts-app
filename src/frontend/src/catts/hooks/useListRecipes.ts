import { backend } from "../../../../declarations/backend";
import { useQuery } from "@tanstack/react-query";

export const useListRecipes = () => {
  return useQuery({
    queryKey: ["recipes"],
    queryFn: async () => {
      return backend.list_recipes();
    },
  });
};
