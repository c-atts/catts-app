import { Recipe } from "catts_engine/declarations/catts_engine.did";
import useRunContext from "../../../context/useRunContext";

export default function RecipeListItem({ recipe }: { recipe: Recipe }) {
  const { name, description } = recipe;
  const { setSelectedRecipe, resetRun } = useRunContext();

  const handleClick = () => {
    resetRun();
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
