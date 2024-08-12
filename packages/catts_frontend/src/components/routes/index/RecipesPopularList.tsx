import RecipeListItem from "@/components/RecipeListItem";
import { useListPopularRecipes } from "@/recipe/hooks/useListPopularRecipes";
import { Link } from "@tanstack/react-router";

export default function RecipesPopularList() {
  const { data, isPending } = useListPopularRecipes();

  if (isPending) {
    return <p>Loading...</p>;
  }

  if (!data) {
    return <p>No data</p>;
  }

  return (
    <div className="flex flex-col gap-5">
      <h1>Popular recipes </h1>
      {data.map((recipe) => (
        <RecipeListItem key={recipe.name} recipe={recipe} />
      ))}
      <Link className="classic-link" search={{ page: 1 }} to="/recipes">
        View all recipes
      </Link>
    </div>
  );
}
