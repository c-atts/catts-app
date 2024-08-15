import { useSupabase } from "@/lib/supabase/SupabaseContext";
import { useQuery } from "@tanstack/react-query";
import { RecipeBasics } from "../types/recipe.types";

export const useSearchRecipes = ({
  search_query,
}: {
  search_query: string;
}) => {
  const supabase = useSupabase();
  return useQuery({
    queryKey: ["recipes", "search", search_query],
    queryFn: async (): Promise<RecipeBasics[]> => {
      const { data, error } = await supabase.rpc("search_recipes", {
        search_query,
      });
      if (error) throw error;
      return data;
    },
  });
};
