import { GQL_QUERY_PROXY_URL } from "@/config";
import useRunContext from "@/context/useRunContext";
import { useQuery } from "@tanstack/react-query";
import { randomString } from "remeda";

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

export function useFetchRecipeQueries(address?: string) {
  const { selectedRecipe } = useRunContext();

  const dynamicVariables = {
    user_eth_address: address ?? "",
    user_eth_address_lowercase: (address ?? "").toLowerCase(),
  };

  return useQuery({
    queryKey: ["RecipeRun", selectedRecipe?.name, address],
    queryFn: async () => {
      if (!selectedRecipe?.name || !address || !selectedRecipe.queries[0]) {
        return null;
      }

      const aggregatedResponse: any[] = [];
      for (const query of selectedRecipe.queries) {
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
            console.error(
              `Expected response to be an object, got ${typeof queryResponse}`,
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
