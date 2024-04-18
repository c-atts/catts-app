import useRunContext from "../../../ run-context/useRunContext";

export default function RecipeBasics() {
  const { selectedRecipe } = useRunContext();

  if (!selectedRecipe) {
    return null;
  }

  const { name, description, author, version } = selectedRecipe;

  return (
    <div>
      <h2>{name}</h2>
      {description}
      <p className="text-sm text-zinc-500">
        {author} published {version}, 8 days ago.
      </p>
    </div>
  );
}
