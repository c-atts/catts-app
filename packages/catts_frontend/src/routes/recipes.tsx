import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { useListRecipes } from "@/recipe/hooks/useListRecipes";
import { useCountRecipes } from "@/recipe/hooks/useCountRecipes";
import RecipesPagination from "@/components/routes/recipes/RecipesPagination";
import RecipeListItem from "@/components/RecipeListItem";

const recipeSearchSchema = z.object({
  page: z.number().int().positive().optional().default(1),
});

export const Route = createFileRoute("/recipes")({
  component: Index,
  validateSearch: (search: Record<string, unknown>) =>
    recipeSearchSchema.parse(search),
});

const LIMIT = 10;

function Index() {
  const { page } = Route.useSearch();
  const { data: recipes } = useListRecipes({ page, limit: LIMIT });
  const { data: count } = useCountRecipes();

  if (!recipes || !count) {
    return null;
  }

  return (
    <div className="w-[1250px] mb-10 bg-radial flex-grow">
      <h1>Recipes</h1>
      <div className="flex flex-col gap-5">
        {recipes?.map((recipe) => (
          <RecipeListItem key={recipe.id} recipe={recipe} />
        ))}
      </div>
      <div className="m-5">
        <RecipesPagination
          currentPage={page}
          totalPages={Math.ceil(count / LIMIT)}
        />
      </div>
    </div>
  );
}
