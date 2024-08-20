import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useNavigate } from "@tanstack/react-router";
import { useActor } from "@/lib/ic/ActorProvider";
import errorToast from "@/lib/util/errorToast";
import { bytesToHex, hexToBytes } from "viem";
import { triggerReindexing } from "@/lib/supabase/triggerReindexing";

export const useDeleteRecipe = () => {
  const { actor } = useActor();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ recipeId }: { recipeId?: string }) => {
      if (!actor || !recipeId) return null;
      const result = await actor.recipe_delete(
        hexToBytes(recipeId as `0x${string}`),
      );
      if ("Ok" in result) {
        await triggerReindexing();
        await queryClient.invalidateQueries({
          queryKey: ["recipes"],
        });
        await queryClient.invalidateQueries({
          queryKey: ["recipe", "by_name", result.Ok.name],
        });
        await queryClient.invalidateQueries({
          queryKey: ["recipe", "by_id", bytesToHex(result.Ok.id as Uint8Array)],
        });
      }
      if ("Err" in result) {
        console.error(result.Err);
        throw new Error(result.Err.message);
      }
      return result;
    },
    onError: (error) => {
      console.error(error);
      errorToast({ error, message: "Could not delete recipe" });
    },
    onSuccess: async (data) => {
      if (data && "Ok" in data) {
        toast.success("Recipe deleted");
        navigate({
          to: "/",
        });
      }
    },
  });
};
