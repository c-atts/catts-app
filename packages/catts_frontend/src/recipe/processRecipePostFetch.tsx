import { Database } from "@/lib/supabase/database.types";
import { querySchema } from "catts-sdk";

// Process a recipe after fetching, parse any query variables from strings back to objects
export function processRecipePostFetch(
  recipe: Database["public"]["Tables"]["recipe"]["Row"],
): Database["public"]["Tables"]["recipe"]["Row"] {
  let processedRecipe = {
    ...recipe,
  };

  if (Array.isArray(recipe.queries) && recipe.queries.length > 0) {
    const processedQueries = [];
    for (const queryRaw of recipe.queries) {
      const { success, data: query } = querySchema.safeParse(queryRaw);
      if (success && query.body?.variables) {
        const variables = JSON.parse(query.body.variables);
        processedQueries.push({
          ...query,
          body: {
            ...query.body,
            variables,
          },
        });
      }
    }
    processedRecipe = {
      ...processedRecipe,
      queries: processedQueries,
    };
  }
  return processedRecipe;
}
