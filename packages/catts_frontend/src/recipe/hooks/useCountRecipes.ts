import { useSupabase } from "@/lib/supabase/SupabaseContext";
import { useQuery } from "@tanstack/react-query";

export const useCountRecipes = () => {
  const supabase = useSupabase();
  return useQuery({
    queryKey: ["recipes", "count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("recipe")
        .select("id", { count: "exact", head: true });
      if (error) throw error;
      return count;
    },
  });
};
