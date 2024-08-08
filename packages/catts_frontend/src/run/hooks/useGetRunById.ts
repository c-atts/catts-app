import { useQuery } from "@tanstack/react-query";
import { useSupabase } from "@/lib/supabase/SupabaseContext";

export const useGetRunById = (id?: string) => {
  const supabase = useSupabase();
  return useQuery({
    queryKey: ["run_by_id", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("run")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
  });
};
