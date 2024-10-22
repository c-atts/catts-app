import { useSupabase } from "@/lib/supabase/SupabaseContext";
import { useQuery } from "@tanstack/react-query";

export const useListRecipes = ({
  page,
  limit,
}: {
  page: number;
  limit: number;
}) => {
  const supabase = useSupabase();
  return useQuery({
    queryKey: ["recipes", "list", page, limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("recipe")
        .select("id, name, description, creator, created, publish_state")
        .order("created", { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      if (error) throw error;
      return data;
    },
  });
};
