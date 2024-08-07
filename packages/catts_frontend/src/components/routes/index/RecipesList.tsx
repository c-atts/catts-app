import { useListRecipes } from "@/recipe/hooks/useListRecipes";
import RecipeListItem from "./RecipeListItem";

export default function RecipesList() {
  const { data, isPending } = useListRecipes();

  if (isPending) {
    return <p>Loading...</p>;
  }

  if (!data) {
    return <p>No data</p>;
  }

  return (
    <ul>
      {data.map((recipe) => (
        <RecipeListItem key={recipe.name} recipe={recipe} />
      ))}
    </ul>
  );
}
