import { Recipe } from "../../../../../declarations/backend/backend.did";
import useRunContext from "../../../ run-context/useRunContext";

export default function RecipeListItem({ recipe }: { recipe: Recipe }) {
  const { name, description } = recipe;
  const { setSelectedRecipe, useInitRun } = useRunContext();

  const handleClick = () => {
    useInitRun.reset(); // Clear any already initialised run
    setSelectedRecipe(recipe);
  };

  return (
    <li
      className="border-zinc-700/50 border-[1px] bg-zinc-800/50 drop-shadow-xl rounded-3xl flex flex-col p-10 cursor-pointer w-full mb-5 hover:bg-zinc-800"
      key={name}
      onClick={handleClick}
    >
      <h3>{name}</h3>
      <p>{description}</p>
    </li>
  );
}
