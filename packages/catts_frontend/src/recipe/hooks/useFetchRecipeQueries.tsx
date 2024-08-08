import { RecipeFull, recipeQueriesSchema } from "../types/recipe.types";

import { GQL_QUERY_PROXY_URL } from "@/config";
import { randomString } from "remeda";
import { useQuery } from "@tanstack/react-query";

function parseVariablesTemplate(
  variablesTemplate: string,
  dynamicValues: Record<string, string>
) {
  if (!variablesTemplate) return {};
  return JSON.parse(
    variablesTemplate.replace(
      /\{(\w+)\}/g,
      (match, key) => dynamicValues[key] || match
    )
  );
}

export function useFetchRecipeQueries(
  recipe: RecipeFull | undefined,
  address?: string
) {
  const dynamicVariables = {
    user_eth_address: address ?? "",
    user_eth_address_lowercase: (address ?? "").toLowerCase(),
  };

  return useQuery({
    queryKey: ["RecipeRun", recipe?.name, address],
    queryFn: async () => {
      if (!recipe || !recipe?.name || !address) {
        return null;
      }

      const { success, data: recipeQueries } = recipeQueriesSchema.safeParse(
        recipe.queries
      );

      if (!success) {
        console.error("Invalid recipe queries", recipe.queries);
        return null;
      }

      const aggregatedResponse: any[] = [];
      for (const query of recipeQueries) {
        const queryVariables = parseVariablesTemplate(
          query.variables,
          dynamicVariables
        );

        try {
          const queryResponse = await requestQuery(
            query.query,
            queryVariables,
            query.endpoint
          );

          if (typeof queryResponse !== "object") {
            console.error(
              `Expected response to be an object, got ${typeof queryResponse}`
            );
            return null;
          }

          aggregatedResponse.push(queryResponse);
        } catch (error) {
          console.error("Error fetching query", error);
          return null;
        }
      }

      return aggregatedResponse;
    },
  });
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
