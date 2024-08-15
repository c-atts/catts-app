import { LoaderCircle } from "lucide-react";
import useRecipeContext from "@/recipe/hooks/useRecipeContext";
import { useGetRecipeByName } from "@/recipe/hooks/useGetRecipeByName";
import { useSelector } from "@xstate/store/react";
import { runStateStore } from "@/run/RunStateStore";
export default function CreateRun() {
  const { recipeName } = useRecipeContext();
  const { data: recipe } = useGetRecipeByName(recipeName);

  const createRunStatus = useSelector(
    runStateStore,
    (state) => state.context.createRunStatus,
  );

  const errorMessage = useSelector(
    runStateStore,
    (state) => state.context.errorMessage,
  );

  if (!recipe) {
    return null;
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="items-center justify-center w-8 h-8 text-xl font-bold rounded-full flex bg-primary text-primary-foreground">
            3
          </div>
          Create run
        </div>
        {createRunStatus === "pending" && !errorMessage && (
          <div className="flex justify-between w-full pl-10">
            <div>Creating...</div>
            <div>
              <LoaderCircle className="w-5 h-5 animate-spin" />
            </div>
          </div>
        )}
        {createRunStatus === "error" && errorMessage && (
          <div className="flex justify-between w-full pl-10">
            <div>Error: {errorMessage}</div>
            <div>🔴</div>
          </div>
        )}
        {createRunStatus === "success" && (
          <div className="flex justify-between w-full pl-10">
            <div>Run created</div>
            <div>✅</div>
          </div>
        )}
      </div>
    </div>
  );
}
