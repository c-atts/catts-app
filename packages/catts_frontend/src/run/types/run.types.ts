import { Database } from "@/lib/supabase/database.types";

export type RunFull = Database["public"]["Tables"]["run"]["Row"];

export type RunBasics = {
  id: string;
  created: string;
  creator: string;
  chain_id: number;
  recipe: {
    name: string;
  } | null;
};
