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

  const settings: RecipeSettings = JSON.parse(
    selectedRecipe?.query_settings[0] ?? "{}"
  );

  const easConfig = getEasConfig(settings.chainId);
  const variables = parseVariablesTemplate(
    selectedRecipe?.query_variables[0] ?? "",
    {
      user_eth_address: address ?? "",
    }
  );
  return useQuery({
    queryKey: ["RecipeRun", selectedRecipe?.name, address, settings.chainId],
    queryFn: async () => {
      if (
        !selectedRecipe?.name ||
        !address ||
        !settings.chainId ||
        !easConfig?.graphqlUrl
      ) {
        return null;
      }
      return request(
        easConfig.graphqlUrl,
        selectedRecipe.queries[0],
        variables
      );
    },
  });
};
