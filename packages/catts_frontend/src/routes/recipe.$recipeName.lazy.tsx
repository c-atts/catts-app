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
import { Skeleton } from "@/components/ui/skeleton";
import RevealDetails from "@/components/routes/recipe/RevealDetails";

export const Route = createLazyFileRoute("/recipe/$recipeName")({
  component: Index,
});

function IndexSkeleton() {
  return <Skeleton className="w-full h-[600px] rounded-lg" />;
}

function IndexInner() {
  const { recipeName } = useRecipeContext();
  const { isPending } = useGetRecipeByName(recipeName);

  return (
    <div className="flex flex-col xl:flex-row w-full xl:w-[1280px] gap-5 mb-10 px-5 xl:px-0">
      <div className="flex flex-col xl:hidden gap-5 w-full">
        <BasicFacts />
        <RunOrSimulate />
      </div>
      {isPending ? (
        <IndexSkeleton />
      ) : (
        <Card className="w-full xl:w-2/3">
          <PublishAndDelete />
          <CardContent className="mt-6 flex flex-col">
            <RecipeReadme />
            <RevealDetails>
              <RecipeDetails />
            </RevealDetails>
          </CardContent>
        </Card>
      )}
      <div className="xl:hidden">
        <LatestRuns />
      </div>
      <div className="hidden xl:flex flex-col gap-5 w-1/3">
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
