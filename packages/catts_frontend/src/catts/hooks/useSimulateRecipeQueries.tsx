import { useQuery } from "@tanstack/react-query";
import request from "graphql-request";
import { randomString } from "remeda";
import { useAccount } from "wagmi";
import { THEGRAPH_QUERY_PROXY_URL } from "../../config";
import useRunContext from "../../context/useRunContext";
import { getEasConfig } from "../../eas/getEasConfig";
import { RecipeSettings } from "../types/recipe-settings.type";

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
    queryKey: ["RecipeRun", selectedRecipe?.slug, address],
    queryFn: async () => {
      if (!selectedRecipe?.slug || !address) {
        return null;
      }

      const aggregatedResponse: any[] = [];
      for (let i = 0; i < selectedRecipe.queries.length; i++) {
        const querySettings: RecipeSettings = JSON.parse(
          selectedRecipe.query_settings[i] ?? "{}",
        );

        const queryVariables = parseVariablesTemplate(
          selectedRecipe.query_variables[i] ?? "",
          dynamicVariables,
        );

        let queryResponse: unknown;
        if (querySettings.query_type == "thegraph") {
          queryResponse = await theGraphRequest(
            selectedRecipe.queries[i],
            queryVariables,
            querySettings,
          );
        } else {
          queryResponse = await easRequest(
            selectedRecipe.queries[i],
            queryVariables,
            querySettings,
          );
        }

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

function theGraphRequest(
  query: string,
  variables: any,
  querySettings: RecipeSettings,
) {
  if (!querySettings.thegraph_query_url) {
    console.error(`Missing thegraph_query_url in query_settings.`);
    return null;
  }

  const cacheId = randomString(8);
  const url = `${THEGRAPH_QUERY_PROXY_URL}/${cacheId}`;
  return request(url, query, variables, {
    "x-thegraph-query-url": querySettings.thegraph_query_url,
  });
}

function easRequest(
  query: string,
  variables: any,
  querySettings: RecipeSettings,
) {
  if (!querySettings.eas_chain_id) {
    console.error(`Missing eas_chain_id in query_settings.`);
    return null;
  }

  const easConfig = getEasConfig(querySettings.eas_chain_id);
  if (!easConfig) {
    console.error(
      `No EAS configuration found for chain_id ${querySettings.eas_chain_id}`,
    );
    return null;
  }
  return request(easConfig.graphqlUrl, query, variables);
}
