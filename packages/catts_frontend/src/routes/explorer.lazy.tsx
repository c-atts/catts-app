import ExploreSearchBox from "@/components/routes/explorer/ExploreSearchBox";
import RecipesList from "@/components/routes/explorer/RecipesList";
import RecipesPopularList from "@/components/routes/explorer/RecipesPopularList";
import RunsList from "@/components/routes/explorer/RunsList";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/explorer")({
  component: Index,
});

function Index() {
  return (
    <div className="flex flex-col w-full items-center bg-radial flex-grow">
      <div className="w-full flex flex-col items-center my-20 px-10">
        <h1 className="w-full font-semibold leading-tight text-6xl text-center">
          Explore recipes and runs
        </h1>
        <ExploreSearchBox />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 w-full xl:w-[1280px] px-5 xl:px-0">
        <RecipesList />
        <RecipesPopularList />
        <RunsList />
      </div>
    </div>
  );
}
