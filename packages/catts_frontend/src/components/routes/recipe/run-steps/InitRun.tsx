import { LoaderCircle } from "lucide-react";
import useCreateRunContext from "@/run/hooks/useCreateRunContext";
import useRecipeContext from "@/recipe/hooks/useRecipeContext";
import { useGetRecipeByName } from "@/recipe/hooks/useGetRecipeByName";
export default function InitRun() {
  const { recipeName } = useRecipeContext();
  const { data: recipe } = useGetRecipeByName(recipeName);
  const { inProgress, runInProgress, errorMessage } = useCreateRunContext();

  if (!recipe) {
    return null;
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="items-center justify-center hidden w-8 h-8 text-xl font-bold rounded-full md:flex bg-primary text-primary-foreground">
            1
          </div>
          Initialise run
        </div>
        {inProgress && !runInProgress && !errorMessage && (
          <div className="flex justify-between w-full pl-10">
            <div>Initialising...</div>
            <div>
              <LoaderCircle className="w-5 h-5 animate-spin" />
            </div>
          </div>
        )}
        {inProgress && !runInProgress && errorMessage && (
          <div className="flex justify-between w-full pl-10">
            <div>Error: {errorMessage}</div>
            <div>🔴</div>
          </div>
        )}
        {inProgress && runInProgress && (
          <div className="flex justify-between w-full pl-10">
            <div>Initialised</div>
            <div>✅</div>
          </div>
        )}
      </div>
    </div>
  );
}
