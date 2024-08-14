import { useQuery } from "@tanstack/react-query";
import { useSupabase } from "@/lib/supabase/SupabaseContext";

export const useGetRecipeByName = (name: string) => {
  const supabase = useSupabase();
  return useQuery({
    queryKey: ["recipe", "by_name", name],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("recipe")
        .select("*")
        .eq("name", name)
        .single();
      if (error) throw error;
      return data;
    },
  });
};
