import { Link } from "@tanstack/react-router";
import { RecipeBasics } from "@/recipe/types/recipe.types";
import ListCard from "@/components/ListCard";

export default function RecipeListItem({ recipe }: { recipe: RecipeBasics }) {
  return (
    <Link params={{ recipeName: recipe.name }} to={"/recipe/$recipeName"}>
      <ListCard className="text-sm hover-darken" key={recipe.id}>
        <div className="flex flex-col">
          <h2>{recipe?.name}</h2>
          <div>{recipe?.description}</div>
        </div>
      </ListCard>
    </Link>
  );
}
