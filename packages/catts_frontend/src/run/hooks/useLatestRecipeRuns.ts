import { useQuery } from "@tanstack/react-query";
import { useSupabase } from "@/lib/supabase/SupabaseContext";

export const useLatestRecipeRuns = ({ recipeId }: { recipeId?: string }) => {
  const supabase = useSupabase();
  return useQuery({
    queryKey: ["runs_recipe_latest", recipeId],
    queryFn: async () => {
      if (!recipeId) return null;
      const { data, error } = await supabase
        .from("run")
        .select(`id, created, creator, chain_id, recipe (name)`)
        .eq("recipe_id", recipeId)
        .order("created", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    },
  });
};
