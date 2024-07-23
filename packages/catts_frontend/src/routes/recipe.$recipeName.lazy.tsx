import { createLazyFileRoute } from "@tanstack/react-router";

import { useEffect } from "react";
import { useGetRecipeByName } from "../catts/hooks/useGetRecipeBySlug";
import useRunContext from "../context/useRunContext";
import RecipeBasics from "../components/routes/recipe/RecipeBasics";
import CreateAttestation from "../components/routes/recipe/CreateAttestation";
import InitRun from "../components/routes/recipe/CreateRun";
import PayForRun from "../components/routes/recipe/PayForRun";
import RecipeDetails from "../components/routes/recipe/RecipeDetails";
import SimulateRun from "../components/routes/recipe/SimulateRun";
import { Section } from "@/components/ui/Section";

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
    <div className="flex gap-5">
      <div className="flex flex-col gap-5 w-2/3">
        <Section>
          <RecipeBasics />
          <RecipeDetails />
          <InitRun />
          <PayForRun />
          <CreateAttestation />
        </Section>
      </div>
      <div className="flex flex-col gap-5 w-1/3">
        <Section>
          <SimulateRun />
        </Section>
      </div>
    </div>
  );
}
