import RecipesList from "@/components/routes/explorer/RecipesList";
import RecipesPopularList from "@/components/routes/explorer/RecipesPopularList";
import RunsList from "@/components/routes/explorer/RunsList";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/explorer")({
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
