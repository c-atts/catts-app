import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { useCountRecipes } from "@/recipe/hooks/useCountRecipes";
import { useListPopularRecipes } from "@/recipe/hooks/useListPopularRecipes";
import RecipeListItemNrOfRuns from "@/components/RecipeListItemNrOfRuns";
import PopularRecipesPagination from "@/components/routes/popular/PopularRecipesPagination";

const recipeSearchSchema = z.object({
  page: z.number().int().positive().optional().default(1),
});

export const Route = createFileRoute("/popular")({
  component: Index,
  validateSearch: (search: Record<string, unknown>) =>
    recipeSearchSchema.parse(search),
});

const LIMIT = 10;

function Index() {
  const { page } = Route.useSearch();
  const { data: recipes } = useListPopularRecipes({ page, limit: LIMIT });
  const { data: count } = useCountRecipes();

  if (!recipes || !count) {
    return null;
  }

  return (
    <div className="w-[1250px] mb-10 bg-radial flex-grow">
      <h1>Popular recipes</h1>
      <div className="flex flex-col gap-5">
        {recipes?.map((recipe) => (
          <RecipeListItemNrOfRuns key={recipe.id} recipe={recipe} />
        ))}
      </div>
      <div className="m-5">
        <PopularRecipesPagination
          currentPage={page}
          totalPages={Math.ceil(count / LIMIT)}
        />
      </div>
    </div>
  );
}
