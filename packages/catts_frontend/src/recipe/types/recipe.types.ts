import { Database } from "@/lib/supabase/database.types";

export type RecipeFull = Database["public"]["Tables"]["recipe"]["Row"];

export type RecipeBasics = Pick<
  RecipeFull,
  "id" | "name" | "description" | "creator" | "created"
>;
