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

  if ("Ok" in data) {
    return (
      <ul className="w-[1250px]">
        {data.Ok.map((recipe) => (
          <RecipeListItem key={recipe.name} recipe={recipe} />
        ))}
      </ul>
    );
  }

  return <p>Error: {data.Err}</p>;
}
