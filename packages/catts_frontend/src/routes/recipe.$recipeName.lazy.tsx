import { createLazyFileRoute } from "@tanstack/react-router";
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

function IndexInner() {
  const { recipeName } = useRecipeContext();
  const { data: recipe } = useGetRecipeByName(recipeName);

  if (!recipe || "Err" in recipe) {
    return <div>Recipe not found</div>;
  }

  return (
    <div className="flex w-[1250px] gap-5 mb-10">
      <Card className="w-2/3">
        <PublishAndDelete />
        <CardContent className="mt-6 flex flex-col">
          <RecipeReadme />
          <RecipeDetails />
        </CardContent>
      </Card>
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
    <RecipeContextProvider recipeName={recipeName}>
      <IndexInner />
    </RecipeContextProvider>
  );
}
