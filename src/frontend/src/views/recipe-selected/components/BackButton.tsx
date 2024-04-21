import useRunContext from "../../../ run-context/useRunContext";

export default function BackButton() {
  const { setSelectedRecipe, resetRun } = useRunContext();

  const handleClick = () => {
    resetRun();
    setSelectedRecipe(undefined);
  };

  return (
    <div>
      <div
        className="inline-flex p-2 px-5 py-2 text-white cursor-pointer hover:bg-zinc-700 rounded-3xl bg-zinc-800"
        onClick={handleClick}
      >
        &lt; Back
      </div>
    </div>
  );
}
