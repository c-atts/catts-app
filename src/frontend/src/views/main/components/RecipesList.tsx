import RecipeListItem from "./RecipeListItem";
import { useListRecipes } from "../../../catts/hooks/useListRecipes";

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
      <ul className="w-full">
        {data.Ok.map((recipe) => (
          <RecipeListItem key={recipe.name} recipe={recipe} />
        ))}
      </ul>
    );
  }

  return (
    <div>
      <h1>Recipes</h1>
      <p>Error: {data.Err}</p>
    </div>
  );
}
