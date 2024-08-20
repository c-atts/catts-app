import { randomString } from "remeda";
import { RecipeFull } from "./types/recipe.types";
import { fetchQuery, queriesSchema } from "catts-sdk";

export async function fetchRecipeQueries(
  recipe: RecipeFull | undefined,
  address?: string,
) {
  if (!recipe || !recipe?.name || !address || !recipe.queries) {
    return null;
  }

  const recipeQueries = queriesSchema.parse(recipe.queries);

  const aggregatedResponse: any[] = [];
  for (const query of recipeQueries) {
    try {
      const queryResponse = await fetchQuery({
        query,
        cacheKey: randomString(8),
        placeHolderValues: {
          userEthAddress: address,
        },
      });

      if (typeof queryResponse !== "object") {
        throw new Error(
          `Expected response to be an object, got ${typeof queryResponse}`,
        );
      }

      aggregatedResponse.push(queryResponse);
    } catch (error) {
      console.error("Error fetching query", error);
      throw new Error("Error fetching query");
    }
  }

  return aggregatedResponse;
}
