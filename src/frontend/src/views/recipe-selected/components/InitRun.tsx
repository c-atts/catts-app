import Button from "../../../components/ui/Button";
import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";
import { useQueryClient } from "@tanstack/react-query";
import useRunContext from "../../../ run-context/useRunContext";

export default function InitRun() {
  const { isSelectedRecipeValid, useInitRun, selectedRecipe } = useRunContext();
  const { mutate: initRun, isPending, data: initRunData } = useInitRun;
  const queryClient = useQueryClient();

  const handleClick = () => {
    if (!selectedRecipe) return;
    queryClient.invalidateQueries({ queryKey: ["run_history"] });
    initRun(selectedRecipe.name);
  };

  const disabled = !selectedRecipe || !isSelectedRecipeValid || isPending;

  const buttonHidden =
    initRunData !== undefined && initRunData !== null && "Ok" in initRunData;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2>Run recipe</h2>
        <p>
          Once you have simulated to verify the run will produce an attestation,
          you can go ahead an run the recipe.
        </p>
      </div>
      {!buttonHidden && (
        <div>
          <Button
            className="mb-4"
            disabled={disabled}
            icon={isPending ? faCircleNotch : undefined}
            onClick={handleClick}
            spin={isPending}
          >
            Run
          </Button>
        </div>
      )}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="items-center justify-center hidden w-8 h-8 text-xl font-bold rounded-full md:flex bg-zinc-300 text-zinc-800">
            1
          </div>
          Initialise run
        </div>
        <div className="pl-10">
          {initRunData && "Err" in initRunData && (
            <div className="flex justify-between w-full">
              <div>Error: {initRunData.Err}</div>
              <div>🔴</div>
            </div>
          )}
          {initRunData && "Ok" in initRunData && (
            <div className="flex justify-between w-full">
              <div>Initialised</div>
              <div>✅</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
