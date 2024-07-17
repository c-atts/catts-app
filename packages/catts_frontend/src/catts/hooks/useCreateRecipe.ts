import { useMutation } from "@tanstack/react-query";
import { useActor } from "../../ic/ActorProvider";
import toast from "react-hot-toast";
import { useNavigate } from "@tanstack/react-router";
import errorToast from "@/utils/errorToast";
function processUrl(url: string) {
  if (url.startsWith("https://github.com")) {
    const u = url.replace(
      "https://github.com",
      "https://raw.githubusercontent.com",
    );
    return u.replace("/tree/", "/");
  }
}

export const useCreateRecipe = () => {
  const { actor } = useActor();
  const navigate = useNavigate({ from: "/create" });
  return useMutation({
    mutationFn: async ({ url }: { url: string }) => {
      if (!actor) return null;

      const processedUrl = processUrl(url);
      const recipe = await fetch(`${processedUrl}/recipe.json`);
      const processor = await fetch(`${processedUrl}/processor.js`);

      if (!recipe.ok || !processor.ok) {
        throw new Error("Failed to load recipe or processor");
      }

      const payload = await recipe.json();
      const processorJs = await processor.text();
      payload.processor = processorJs;
      payload.display_name = payload.display_name ? [payload.display_name] : [];
      payload.description = payload.description ? [payload.description] : [];
      payload.keywords = payload.keywords ? [payload.keywords] : [];
      if (Array.isArray(payload.queries)) {
        for (const query of payload.queries) {
          query.variables = JSON.stringify(query.variables);
        }
      }
      return actor.recipe_create(payload, "README");
    },
    onError: (error) => {
      console.error(error);
      errorToast({ error, message: "Could not create recipe" });
    },
    onSuccess: (data) => {
      toast.success("Recipe created");
      if (data && "Ok" in data) {
        navigate({
          to: "/recipe/$recipeName",
          params: { recipeName: data.Ok.name },
        });
      }
    },
  });
};
