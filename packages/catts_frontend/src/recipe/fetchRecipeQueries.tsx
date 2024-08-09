import { GQL_QUERY_PROXY_URL } from "@/config";
import { randomString } from "remeda";
import { RecipeFull, recipeQueriesSchema } from "./types/recipe.types";

function parseVariablesTemplate(
  variablesTemplate: string,
  dynamicValues: Record<string, string>,
) {
  if (!variablesTemplate) return {};
  return JSON.parse(
    variablesTemplate.replace(
      /\{(\w+)\}/g,
      (match, key) => dynamicValues[key] || match,
    ),
  );
}

export async function fetchRecipeQueries(
  recipe: RecipeFull | undefined,
  address?: string,
) {
  if (!recipe || !recipe?.name || !address) {
    return null;
  }

  const dynamicVariables = {
    user_eth_address: address ?? "",
    user_eth_address_lowercase: (address ?? "").toLowerCase(),
  };

  const { success, data: recipeQueries } = recipeQueriesSchema.safeParse(
    recipe.queries,
  );

  if (!success) {
    console.error("Invalid recipe queries", recipe.queries);
    throw new Error("Invalid recipe queries");
  }

  const aggregatedResponse: any[] = [];
  for (const query of recipeQueries) {
    const queryVariables = parseVariablesTemplate(
      query.variables,
      dynamicVariables,
    );

    try {
      const queryResponse = await requestQuery(
        query.query,
        queryVariables,
        query.endpoint,
      );

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

async function requestQuery(query: string, variables: any, queryUrl: string) {
  const cacheId = randomString(8);
  const url = `${GQL_QUERY_PROXY_URL}/${cacheId}`;
  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-gql-query-url": queryUrl,
    },
    body: JSON.stringify({ query, variables }),
  }).then((res) => res.json());
}
