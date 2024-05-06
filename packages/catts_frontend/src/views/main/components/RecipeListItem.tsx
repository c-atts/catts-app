import { Recipe } from "catts_engine/declarations/catts_engine.did";
import useRunContext from "../../../context/useRunContext";
import { formatDistance } from "date-fns";

export default function RecipeListItem({ recipe }: { recipe: Recipe }) {
  const { name, description, version, created } = recipe;
  const { setSelectedRecipe, resetRun } = useRunContext();
  const createdDate = new Date(Number(created / BigInt(1_000_000)));
  const when = formatDistance(new Date(createdDate), new Date(), {
    addSuffix: true,
  });
  const handleClick = () => {
    resetRun();
    setSelectedRecipe(recipe);
  };

  return (
    <li
      className="border-zinc-700/50 border-[1px] bg-zinc-800 drop-shadow-xl rounded-3xl flex flex-col p-10 cursor-pointer w-full mb-10 hover:bg-zinc-900 "
      key={name}
      onClick={handleClick}
    >
      <h3>{name}</h3>
      <p>{description}</p>
      <p className="text-sm text-zinc-500">
        Version {version}, {when}.
      </p>
    </li>
  );
}
