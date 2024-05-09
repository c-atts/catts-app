import { createLazyFileRoute } from "@tanstack/react-router";

import { useEffect } from "react";
import { useGetRecipeByName } from "../catts/hooks/useGetRecipeByName";
import useRunContext from "../context/useRunContext";
import Section from "../components/ui/Section";
import RecipeBasics from "../components/routes/recipe/RecipeBasics";
import CreateAttestation from "../components/routes/recipe/CreateAttestation";
import InitRun from "../components/routes/recipe/CreateRun";
import PayForRun from "../components/routes/recipe/PayForRun";
import RecipeDetails from "../components/routes/recipe/RecipeDetails";
import SimulateRun from "../components/routes/recipe/SimulateRun";

export const Route = createLazyFileRoute("/recipe/$recipeName")({
  component: Index,
});

function Index() {
  const { recipeName } = Route.useParams();
  const { data: recipe, isPending } = useGetRecipeByName(recipeName);
  const { setSelectedRecipe } = useRunContext();

  useEffect(() => {
    if (recipe && "Ok" in recipe) {
      setSelectedRecipe(recipe.Ok);
    }
  }, [recipe]);

  if (isPending) {
    return <div>Loading...</div>;
  }

  if (!recipe || "Err" in recipe) {
    return <div>Recipe not found</div>;
  }

  return (
    <Section>
      <div className="flex flex-col gap-5">
        <RecipeBasics />
        <RecipeDetails />
        <SimulateRun />
        <InitRun />
        <PayForRun />
        <CreateAttestation />
      </div>
    </Section>
  );
}
