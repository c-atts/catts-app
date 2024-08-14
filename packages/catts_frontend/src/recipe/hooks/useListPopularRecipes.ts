import { useSupabase } from "@/lib/supabase/SupabaseContext";
import { useQuery } from "@tanstack/react-query";

export const useListPopularRecipes = ({
  page,
  limit,
}: {
  page: number;
  limit: number;
}) => {
  const supabase = useSupabase();
  return useQuery({
    queryKey: ["recipes", "list", "popular", page, limit],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("list_popular_recipes", {
        page,
        pagesize: limit,
      });
      if (error) throw error;
      return data;
    },
  });
};
