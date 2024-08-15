import RecipeListItemNrOfRuns from "@/components/RecipeListItemNrOfRuns";
import { useListPopularRecipes } from "@/recipe/hooks/useListPopularRecipes";
import { Link } from "@tanstack/react-router";

export default function RecipesPopularList() {
  const { data } = useListPopularRecipes({ page: 1, limit: 10 });

  if (!data) {
    return null;
  }

  return (
    <div className="flex flex-col gap-5">
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
