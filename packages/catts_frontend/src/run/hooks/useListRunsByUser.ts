import { useSupabase } from "@/lib/supabase/SupabaseContext";
import { useQuery } from "@tanstack/react-query";

export const useListRunsByUser = (address: string) => {
  const supabase = useSupabase();
  return useQuery({
    queryKey: ["runs_list_by_user", address],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("run")
        .select(`id, created, creator, chain_id, recipe (name)`)
        .order("created", { ascending: false })
        .eq("creator", address);
      if (error) throw error;
      return data;
    },
  });
};
