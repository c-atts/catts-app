import { useSupabase } from "@/lib/supabase/SupabaseContext";
import { useQuery } from "@tanstack/react-query";

export const useListPopularRecipes = () => {
  const supabase = useSupabase();
  return useQuery({
    queryKey: ["recipe_popular_list"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("list_popular_recipes");
      if (error) throw error;
      return data;
    },
  });
};
