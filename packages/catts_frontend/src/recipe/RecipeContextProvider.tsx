import { ReactNode, createContext } from "react";
import { RecipeContextType } from "./types/recipe-context.type";

export const RecipeContext = createContext<RecipeContextType | undefined>(
  undefined,
);

export function RecipeContextProvider({
  children,
  recipeName,
}: {
  children: ReactNode;
  recipeName: string;
}) {
  return (
    <RecipeContext.Provider
      value={{
        recipeName,
      }}
    >
      {children}
    </RecipeContext.Provider>
  );
}
