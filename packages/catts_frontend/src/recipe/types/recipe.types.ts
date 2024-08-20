import { Database } from "@/lib/supabase/database.types";
import { z } from "zod";

export type RecipeFull = Database["public"]["Tables"]["recipe"]["Row"];

export type RecipeBasics = Pick<
  RecipeFull,
  "id" | "name" | "description" | "creator" | "created" | "publish_state"
>;

export const recipeQueryBodySchema = z
  .object({
    query: z.string(),
    variables: z.string(),
  })
  .optional()
  .nullable();

export const recipeQuerySchema = z.object({
  url: z.string(),
  headers: z.string().optional().nullable(),
  filter: z.string().optional().nullable(),
  body: recipeQueryBodySchema,
});

export type RecipeQuery = z.infer<typeof recipeQuerySchema>;

export const recipeQueriesSchema = z.array(recipeQuerySchema);

export type RecipeQueries = z.infer<typeof recipeQueriesSchema>;
