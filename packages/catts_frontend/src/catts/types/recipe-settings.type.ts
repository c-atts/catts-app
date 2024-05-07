export type RecipeQueryType = "eas" | "thegraph";

export type RecipeSettings = {
  query_type: RecipeQueryType;
  eas_chain_id?: number;
  thegraph_query_url?: string;
};
