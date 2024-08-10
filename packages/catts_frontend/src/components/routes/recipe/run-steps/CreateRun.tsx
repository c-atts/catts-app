import { LoaderCircle } from "lucide-react";
import useCreateRunContext from "@/run/hooks/useCreateRunContext";
import useRecipeContext from "@/recipe/hooks/useRecipeContext";
import { useGetRecipeByName } from "@/recipe/hooks/useGetRecipeByName";
export default function CreateRun() {
  const { recipeName } = useRecipeContext();
  const { data: recipe } = useGetRecipeByName(recipeName);
  const { inProgress, runInProgress, errorMessage, runCreated } =
    useCreateRunContext();

  if (!recipe) {
    return null;
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="items-center justify-center hidden w-8 h-8 text-xl font-bold rounded-full md:flex bg-primary text-primary-foreground">
            2
          </div>
          Create run
        </div>
        {inProgress && !runInProgress && !errorMessage && (
          <div className="flex justify-between w-full pl-10">
            <div>Creating...</div>
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
        {runCreated && (
          <div className="flex justify-between w-full pl-10">
            <div>Run created</div>
            <div>✅</div>
          </div>
        )}
      </div>
    </div>
  );
}
