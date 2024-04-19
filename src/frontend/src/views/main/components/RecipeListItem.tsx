import { Recipe } from "../../../../../declarations/backend/backend.did";
import useRunContext from "../../../ run-context/useRunContext";

export default function RecipeListItem({ recipe }: { recipe: Recipe }) {
  const { name, description } = recipe;
  const { setSelectedRecipe, reset } = useRunContext();

  const handleClick = () => {
    reset(); // Clear all run context state
    console.log("Clearing run context state");
    setSelectedRecipe(recipe);
  };

  return (
    <li
      className="border-zinc-700/50 border-[1px] bg-theme-200/10 drop-shadow-xl rounded-2xl flex flex-col p-10 cursor-pointer w-full mb-10 hover:bg-theme-200/20"
      key={name}
      onClick={handleClick}
    >
      <h3>{name}</h3>
      <p>{description}</p>
    </li>
  );
}
