import { useSupabase } from "@/lib/supabase/SupabaseContext";
import { useQuery } from "@tanstack/react-query";

export const useCountRuns = () => {
  const supabase = useSupabase();
  return useQuery({
    queryKey: ["runs_count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("run")
        .select("id", { count: "exact", head: true });
      if (error) throw error;
      return count;
    },
  });
};
