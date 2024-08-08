import { Database } from "@/lib/supabase/database.types";

export type RunFull = Database["public"]["Tables"]["run"]["Row"];

export type RunBasics = Pick<RunFull, "id" | "chain_id" | "created">;
