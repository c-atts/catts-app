import { useSupabase } from "@/lib/supabase/SupabaseContext";
import { useQuery } from "@tanstack/react-query";

export const useLatestRecipeRuns = ({ recipeId }: { recipeId: string }) => {
  const supabase = useSupabase();
  return useQuery({
    queryKey: ["runs_recipe_lates", recipeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("run")
        .select(`id, created, chain_id`)
        .eq("recipe_id", recipeId)
        .order("created", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    },
  });
};
