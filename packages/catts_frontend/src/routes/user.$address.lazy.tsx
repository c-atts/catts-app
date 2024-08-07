import { createLazyFileRoute } from "@tanstack/react-router";
import { useListRecipesByUser } from "@/recipe/hooks/useListRecipesByUser";
import RecipeListItem from "@/components/routes/index/RecipeListItem";

export const Route = createLazyFileRoute("/user/$address")({
  component: Index,
});

function Index() {
  const { address } = Route.useParams();
  const { data, isPending } = useListRecipesByUser(address);

  if (isPending) {
    return <div>Loading...</div>;
  }

  if (!data) {
    return <div>No recipes found</div>;
  }

  return (
    <div className="flex gap-5">
      <div className="flex flex-col gap-5 w-2/3">
        <ul>
          {data.map((recipe) => (
            <RecipeListItem key={recipe.name} recipe={recipe} />
          ))}
        </ul>{" "}
      </div>
    </div>
  );
}
