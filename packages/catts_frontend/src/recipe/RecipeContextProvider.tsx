import { ReactNode, createContext, useState } from "react";
import { RecipeContextType } from "./types/run-context.type";
import { RecipeContextStateType } from "./types/run-context-state.type";
import { RecipeFull } from "./types/recipe.types";

export const RecipeContext = createContext<RecipeContextType | undefined>(
  undefined,
);

export function RecipeContextProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<RecipeContextStateType>();

  function setRecipe(recipe: RecipeFull) {
    setState((s) => {
      return {
        ...s,
        recipe,
      };
    });
  }

  return (
    <RecipeContext.Provider
      value={{
        recipe: state?.recipe,
        setRecipe,
      }}
    >
      {children}
    </RecipeContext.Provider>
  );
}
