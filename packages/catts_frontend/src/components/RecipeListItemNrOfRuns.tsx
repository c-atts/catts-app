import { Link } from "@tanstack/react-router";
import ListCard from "@/components/ListCard";
import { RecipeBasics } from "@/recipe/types/recipe.types";

export default function RecipeListItemNrOfRuns({
  recipe,
}: {
  recipe: RecipeBasics & { nr_of_runs: number };
}) {
  const { name, id, nr_of_runs } = recipe;
  return (
    <Link params={{ recipeName: name }} to={"/recipe/$recipeName"}>
      <ListCard className="text-sm hover-darken" key={id}>
        <div className="flex flex-col gap-2">
          <h2 className="my-0">{name}</h2>
          <div>{recipe?.description}</div>
          <div className="text-foreground/50">{nr_of_runs} runs</div>
        </div>
      </ListCard>
    </Link>
  );
}
