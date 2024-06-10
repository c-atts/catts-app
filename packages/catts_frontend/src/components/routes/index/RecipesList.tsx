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
      <ul className="w-[750px]">
        {data.Ok.map((recipe) => (
          <RecipeListItem key={recipe.slug} recipe={recipe} />
        ))}
      </ul>
    );
  }

  return <p>Error: {data.Err}</p>;
}
