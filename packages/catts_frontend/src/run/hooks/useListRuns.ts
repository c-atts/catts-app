import { useSupabase } from "@/lib/supabase/SupabaseContext";
import { useQuery } from "@tanstack/react-query";

export const useListRuns = ({
  page,
  limit,
}: {
  page: number;
  limit: number;
}) => {
  const supabase = useSupabase();
  return useQuery({
    queryKey: ["runs", "list", page, limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("run")
        .select(
          `id, created, creator, chain_id, error, attestation_uid, attestation_transaction_hash, recipe (name)`,
        )
        .order("created", { ascending: false })
        .range((page - 1) * limit, page * limit - 1);
      if (error) throw error;
      return data;
    },
  });
};
