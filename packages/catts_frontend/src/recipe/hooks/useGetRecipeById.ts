import { useQuery } from "@tanstack/react-query";
import { useSupabase } from "@/lib/supabase/SupabaseContext";

export const useGetRecipeById = (id?: string) => {
  const supabase = useSupabase();
  return useQuery({
    queryKey: ["recipe_by_id", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("recipe")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
  });
};
