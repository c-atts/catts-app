import { Link } from "@tanstack/react-router";
import ListCard from "@/components/ListCard";
import { RecipeBasics } from "@/recipe/types/recipe.types";

export default function RecipeListItem({ recipe }: { recipe: RecipeBasics }) {
  return (
    <Link params={{ recipeName: recipe.name }} to={"/recipe/$recipeName"}>
      <ListCard className="text-sm hover-darken" key={recipe.id}>
        <div className="flex flex-col gap-1">
          <h2 className="my-0">{recipe?.name}</h2>
          <div>{recipe?.description}</div>
        </div>
      </ListCard>
    </Link>
  );
}
