import { Link } from "@tanstack/react-router";
import { useListRecipes } from "@/recipe/hooks/useListRecipes";
import RecipeListItem from "@/components/RecipeListItem";

export default function RecipesList() {
  const { data } = useListRecipes({ page: 1, limit: 10 });

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
