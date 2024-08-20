import { Link } from "@tanstack/react-router";
import { useListRecipes } from "@/recipe/hooks/useListRecipes";
import RecipeListItem from "@/components/RecipeListItem";
import { Skeleton } from "@/components/ui/skeleton";

function RecipesListSkeleton() {
  return (
    <div className="flex flex-col gap-5 pb-10">
      <h1>Latest recipes</h1>
      <div className="flex flex-col gap-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton className="w-full h-[140px] rounded-lg" key={index} />
        ))}
      </div>
    </div>
  );
}

export default function RecipesList() {
  const { data, isPending } = useListRecipes({ page: 1, limit: 10 });

  if (isPending) {
    return <RecipesListSkeleton />;
  }

  if (!data) {
    return null;
  }

  return (
    <div className="flex flex-col gap-5 pb-10">
      <h1>Latest recipes</h1>
      {data.map((recipe) => (
        <RecipeListItem key={recipe.name} recipe={recipe} />
      ))}
      <Link
        className="classic-link max-w-fit"
        search={{ page: 1 }}
        to="/recipes"
      >
        View all recipes
      </Link>
    </div>
  );
}
