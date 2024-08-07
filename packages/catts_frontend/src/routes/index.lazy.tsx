import { createLazyFileRoute } from "@tanstack/react-router";
import RecipesList from "../components/routes/index/RecipesList";
import RunsList from "@/components/routes/index/RunsList";

export const Route = createLazyFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="grid grid-cols-3 gap-4 p-4">
      <RecipesList />
      <RunsList />
    </div>
  );
}
