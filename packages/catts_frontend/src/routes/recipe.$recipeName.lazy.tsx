import { createLazyFileRoute } from "@tanstack/react-router";

import { useEffect, useRef } from "react";
import RecipeBasics from "../components/routes/recipe/RecipeBasics";
import CreateAttestation from "../components/routes/recipe/CreateAttestation";
import InitRun from "../components/routes/recipe/InitRun";
import PayForRun from "../components/routes/recipe/PayForRun";
import RecipeDetails from "../components/routes/recipe/RecipeDetails";
import SimulateRun from "../components/routes/recipe/SimulateRun";
import { Section } from "@/components/ui/Section";
import { useGetRecipeByName } from "@/recipe/hooks/useGetRecipeByName";
import { RecipeContextProvider } from "@/recipe/RecipeContextProvider";
import useRecipeContext from "@/recipe/hooks/useRecipeContext";
import { RunContextProvider } from "@/run/RunContextProvider";

export const Route = createLazyFileRoute("/recipe/$recipeName")({
  component: Index,
});

function IndexInner({ recipeName }: { recipeName: string }) {
  const { data: recipe, isPending } = useGetRecipeByName(recipeName);
  const { setRecipe } = useRecipeContext();

  const loadedRecipeName = useRef<string>();

  useEffect(() => {
    if (recipe && recipe.name !== loadedRecipeName.current) {
      setRecipe(recipe);
      loadedRecipeName.current = recipe.name;
    }
  }, [recipe, setRecipe]);

  if (isPending) {
    return <div>Loading...</div>;
  }

  if (!recipe || "Err" in recipe) {
    return <div>Recipe not found</div>;
  }

  return (
    <div className="flex gap-5">
      <div className="flex flex-col gap-5 w-2/3">
        <Section>
          <RecipeBasics />
          <RecipeDetails />
        </Section>
      </div>
      <div className="flex flex-col gap-5 w-1/3">
        <RunContextProvider>
          <Section>
            <InitRun />
            <PayForRun />
            <CreateAttestation />
          </Section>
        </RunContextProvider>
        <Section>
          <SimulateRun />
        </Section>
      </div>
    </div>
  );
}

function Index() {
  const { recipeName } = Route.useParams();

  return (
    <RecipeContextProvider>
      <IndexInner recipeName={recipeName} />
    </RecipeContextProvider>
  );
}
