import { Database } from "@/lib/supabase/database.types";
import { z } from "zod";

export type RecipeFull = Database["public"]["Tables"]["recipe"]["Row"];

export type RecipeBasics = Pick<
  RecipeFull,
  "id" | "name" | "description" | "creator" | "created"
>;

export const recipeQuerySchema = z.object({
  endpoint: z.string(),
  query: z.string(),
  variables: z.string(),
});

export type RecipeQuery = z.infer<typeof recipeQuerySchema>;

export const recipeQueriesSchema = z.array(recipeQuerySchema);

export type RecipeQueries = z.infer<typeof recipeQueriesSchema>;
