import { useSupabase } from "@/lib/supabase/SupabaseContext";
import { useQuery } from "@tanstack/react-query";

export const useListRecipesByUser = (address: string) => {
  const supabase = useSupabase();
  address = address.toLowerCase();
  return useQuery({
    queryKey: ["recipes", "list", "by_user", address],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("recipe")
        .select("id, name, description, creator, created")
        .order("created", { ascending: false })
        .eq("creator", address);
      if (error) throw error;
      return data;
    },
  });
};
