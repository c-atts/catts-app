import { Database } from "@/lib/supabase/database.types";

export type RunFull = Database["public"]["Tables"]["run"]["Row"];

export type RunBasics = {
  id: string;
  created: string;
  creator: string;
  chain_id: number;
  error: string | null;
  attestation_uid: string | null;
  attestation_transaction_hash: string | null;
  recipe: {
    name: string;
  } | null;
};
