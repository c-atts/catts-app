import { createLazyFileRoute } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import RecipeReadme from "../components/routes/recipe/RecipeReadme";
import RecipeDetails from "../components/routes/recipe/RecipeDetails";
import { useGetRecipeByName } from "@/recipe/hooks/useGetRecipeByName";
import { RecipeContextProvider } from "@/recipe/RecipeContextProvider";
import useRecipeContext from "@/recipe/hooks/useRecipeContext";
import LatestRuns from "@/components/routes/recipe/LatestRuns";
import { Card, CardContent } from "@/components/ui/card";
import PublishAndDelete from "@/components/routes/recipe/PublishAndDelete";
import RunOrSimulate from "@/components/routes/recipe/RunOrSimulate";
import BasicFacts from "@/components/routes/recipe/BasicFacts";

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
        <Card>
          <PublishAndDelete />
          <CardContent className="mt-6 flex flex-col gap-12">
            <RecipeReadme />
            <RecipeDetails />
          </CardContent>
        </Card>
      </div>
      <div className="flex flex-col gap-5 w-1/3">
        <BasicFacts />
        <RunOrSimulate />
        <LatestRuns />
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
