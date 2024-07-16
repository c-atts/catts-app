import { useQuery } from "@tanstack/react-query";
import request from "graphql-request";
import { randomString } from "remeda";
import { useAccount } from "wagmi";
import { GQL_QUERY_PROXY_URL } from "../../config";
import useRunContext from "../../context/useRunContext";
// import { getEasConfig } from "../../eas/getEasConfig";
// import { RecipeSettings } from "../types/recipe-settings.type";

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

export function useSimulateRecipeQueries() {
  const { selectedRecipe } = useRunContext();
  const { address } = useAccount();

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

        // let queryResponse: unknown;
        // if (querySettings.query_type == "thegraph") {
        //   queryResponse = await theGraphRequest(
        //     queries[i],
        //     queryVariables,
        //     querySettings,
        //   );
        // } else {
        //   queryResponse = await easRequest(
        //     queries[i],
        //     queryVariables,
        //     querySettings,
        //   );
        // }

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
      }

      return aggregatedResponse;
    },
  });
}

function requestQuery(query: string, variables: any, queryUrl: string) {
  const cacheId = randomString(8);
  const url = `${GQL_QUERY_PROXY_URL}/${cacheId}`;
  return request(url, query, variables, {
    "x-gql-query-url": queryUrl,
  });
}

// function theGraphRequest(
//   query: string,
//   variables: any,
//   querySettings: RecipeSettings,
// ) {
//   if (!querySettings.thegraph_query_url) {
//     console.error(`Missing thegraph_query_url in query_settings.`);
//     return null;
//   }

//   const cacheId = randomString(8);
//   const url = `${THEGRAPH_QUERY_PROXY_URL}/${cacheId}`;
//   return request(url, query, variables, {
//     "x-thegraph-query-url": querySettings.thegraph_query_url,
//   });
// }

// function easRequest(
//   query: string,
//   variables: any,
//   querySettings: RecipeSettings,
// ) {
//   if (!querySettings.eas_chain_id) {
//     console.error(`Missing eas_chain_id in query_settings.`);
//     return null;
//   }

//   const easConfig = getEasConfig(querySettings.eas_chain_id);
//   if (!easConfig) {
//     console.error(
//       `No EAS configuration found for chain_id ${querySettings.eas_chain_id}`,
//     );
//     return null;
//   }
//   return request(easConfig.graphqlUrl, query, variables);
// }
