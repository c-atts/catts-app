import { createLazyFileRoute } from "@tanstack/react-router";
import RecipesList from "../components/routes/index/RecipesList";
import RunsList from "@/components/routes/index/RunsList";
import RecipesPopularList from "@/components/routes/index/RecipesPopularList";

export const Route = createLazyFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="grid grid-cols-3 gap-5">
      <RecipesList />
      <RecipesPopularList />
      <RunsList />
    </div>
  );
}
