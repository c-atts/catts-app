import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { useSearchRecipes } from "@/recipe/hooks/useSearchRecipes";
import RecipeListItem from "@/components/RecipeListItem";

const recipeSearchSchema = z.object({
  q: z.string(),
});

export const Route = createFileRoute("/search")({
  component: Index,
  validateSearch: (search: Record<string, unknown>) =>
    recipeSearchSchema.parse(search),
});

function Index() {
  const { q } = Route.useSearch();

  const { data: recipes, isPending } = useSearchRecipes({ search_query: q });

  return (
    <div className="w-full xl:w-[1280px] mb-10 bg-radial flex-grow px-5 xl:px-0">
      <h1>Search results</h1>
      {isPending && <div>Loading...</div>}
      <div className="flex flex-col gap-5">
        {recipes && recipes.length === 0 && <div>No results found</div>}
        {recipes?.map((recipe) => (
          <RecipeListItem key={recipe.id} recipe={recipe} />
        ))}
      </div>
    </div>
  );
}
