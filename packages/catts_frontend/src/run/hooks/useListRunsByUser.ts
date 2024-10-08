import { useSupabase } from "@/lib/supabase/SupabaseContext";
import { useQuery } from "@tanstack/react-query";

export const useListRunsByUser = (address: string) => {
  const supabase = useSupabase();
  return useQuery({
    queryKey: ["runs", "list", "by_user", address],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("run")
        .select(
          `id, created, creator, chain_id, error, attestation_uid, attestation_transaction_hash, recipe (name)`,
        )
        .order("created", { ascending: false })
        .eq("creator", address);
      if (error) throw error;
      return data;
    },
  });
};
