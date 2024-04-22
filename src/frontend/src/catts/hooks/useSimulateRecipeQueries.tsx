import { RecipeSettings } from "../types/recipe-settings.type";
import { getEasConfig } from "../../eas/getEasConfig";
import request from "graphql-request";
import { useAccount } from "wagmi";
import { useQuery } from "@tanstack/react-query";
import useRunContext from "../../ run-context/useRunContext";

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

export const useSimulateRecipeQueries = () => {
  const { selectedRecipe } = useRunContext();
  const { address } = useAccount();

  const dynamicVariables = {
    user_eth_address: address ?? "",
  };

  return useQuery({
    queryKey: ["RecipeRun", selectedRecipe?.name, address],
    queryFn: async () => {
      if (!selectedRecipe?.name || !address) {
        return null;
      }

      const aggregatedResponse: any[] = [];
      for (let i = 0; i < selectedRecipe.queries.length; i++) {
        const querySettings: RecipeSettings = JSON.parse(
          selectedRecipe.query_settings[i] ?? "{}"
        );

        const easConfig = getEasConfig(querySettings.chain_id);
        if (!easConfig) {
          console.error(
            `No EAS configuration found for chain_id ${querySettings.chain_id}`
          );
          return null;
        }

        const queryVariables = parseVariablesTemplate(
          selectedRecipe.query_variables[i] ?? "",
          dynamicVariables
        );

        const queryResponse = await request(
          easConfig.graphqlUrl,
          selectedRecipe.queries[i],
          queryVariables
        );

        if (typeof queryResponse !== "object") {
          console.error(
            `Expected response to be an object, got ${typeof queryResponse}`
          );
          return null;
        }

        aggregatedResponse.push(queryResponse);
      }

      return aggregatedResponse;
    },
  });
};
