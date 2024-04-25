import useRunContext from "../../../context/useRunContext";

export default function RecipeBasics() {
  const { selectedRecipe } = useRunContext();

  if (!selectedRecipe) {
    return null;
  }

  const { name, description, version } = selectedRecipe;

  return (
    <div>
      <h2>{name}</h2>
      {description}
      <p className="text-sm text-zinc-500">Version {version}, 8 days ago.</p>
    </div>
  );
}
