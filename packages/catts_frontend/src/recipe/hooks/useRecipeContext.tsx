import { useContext } from "react";
import { RecipeContext } from "../RecipeContextProvider";
import { RecipeContextType } from "../types/recipe-context.type";

export default function useRecipeContext(): RecipeContextType {
  const context = useContext(RecipeContext);
  if (!context) {
    throw new Error("useRunContext must be used within an RunContextProvider");
  }
  return context;
}
