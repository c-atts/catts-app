import RecipeListItemNrOfRuns from "@/components/RecipeListItemNrOfRuns";
import { Skeleton } from "@/components/ui/skeleton";
import { useListPopularRecipes } from "@/recipe/hooks/useListPopularRecipes";
import { Link } from "@tanstack/react-router";

function RecipesPopularListSkeleton() {
  return (
    <div className="flex flex-col gap-5 pb-10">
      <h1>Popular recipes</h1>
      <div className="flex flex-col gap-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton className="w-full h-[140px] rounded-lg" key={index} />
        ))}
      </div>
    </div>
  );
}

export default function RecipesPopularList() {
  const { data, isPending } = useListPopularRecipes({ page: 1, limit: 10 });

  if (isPending) {
    return <RecipesPopularListSkeleton />;
  }

  if (!data) {
    return null;
  }

  return (
    <div className="flex flex-col gap-5 pb-10">
      <h1>Popular recipes </h1>
      {data.map((recipe) => (
        <RecipeListItemNrOfRuns key={recipe.name} recipe={recipe} />
      ))}
      <Link
        className="classic-link max-w-fit"
        search={{ page: 1 }}
        to="/popular"
      >
        View all popular
      </Link>
    </div>
  );
}
