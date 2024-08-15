import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useActor } from "@/lib/ic/ActorProvider";
import errorToast from "@/lib/util/errorToast";
import { Recipe, Result_2 } from "catts_engine/declarations/catts_engine.did";
function processUrl(url: string) {
  if (url.startsWith("https://github.com")) {
    const u = url.replace(
      "https://github.com",
      "https://raw.githubusercontent.com",
    );
    return u.replace("/tree/", "/");
  }
  return url;
}

async function fetchFile(url: string, file: string) {
  const uniqueParam = `t=${new Date().getTime()}`;
  return fetch(`${url}/${file}?${uniqueParam}`);
}

export const useCreateRecipe = ({
  onSuccess,
}: {
  onSuccess?: (recipe: Recipe) => void;
}) => {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ url }: { url: string }): Promise<Result_2 | null> => {
      if (!actor) return null;

      const processedUrl = processUrl(url);
      const recipeResponse = await fetchFile(processedUrl, "recipe.json");
      const processorResponse = await fetchFile(processedUrl, "processor.js");
      const readmeResponse = await fetchFile(processedUrl, "README.md");

      if (!recipeResponse.ok) {
        throw new Error("Could not fetch recipe.json");
      }
      if (!processorResponse.ok) {
        throw new Error("Could not fetch processor.js");
      }
      if (!readmeResponse.ok) {
        throw new Error("Could not fetch README.md");
      }

      const payload = await recipeResponse.json();
      const processorJs = await processorResponse.text();
      const readme = await readmeResponse.text();

      payload.processor = processorJs;
      payload.description = payload.description ? [payload.description] : [];
      payload.keywords = payload.keywords ? [payload.keywords] : [];
      if (Array.isArray(payload.queries)) {
        for (const query of payload.queries) {
          query.variables = JSON.stringify(query.variables);
        }
      }
      const createResult = await actor.recipe_create(payload, readme);
      if ("Ok" in createResult) {
        await fetch(import.meta.env.VITE_SUPABASE_REINDEX_URL);
        await queryClient.invalidateQueries({
          queryKey: ["recipes"],
        });
        await queryClient.invalidateQueries({
          queryKey: ["recipe", "by_name", createResult.Ok.name],
        });
        await queryClient.invalidateQueries({
          queryKey: ["recipe", "by_id", createResult.Ok.id],
        });
      }
      if ("Err" in createResult) {
        console.error(createResult.Err);
        throw new Error(createResult.Err.message);
      }
      return createResult;
    },
    onError: (error) => {
      console.error(error);
      errorToast({ error, message: "Could not create recipe" });
    },
    onSuccess: async (data) => {
      if (data && "Ok" in data) {
        toast.success("Recipe created");
        queryClient.invalidateQueries({
          queryKey: ["recipe", "readme", "by_name", data.Ok.name],
        });
        queryClient.invalidateQueries({
          queryKey: ["recipe", "by_name", data.Ok.name],
        });
        queryClient.invalidateQueries({
          queryKey: ["recipe", "by_id", data.Ok.id],
        });
        onSuccess && onSuccess(data.Ok);
      }
    },
  });
};
