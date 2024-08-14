import { Badge } from "@/components/ui/badge";
import Markdown from "react-markdown";
import UserLink from "@/components/UserLink";
import remarkGfm from "remark-gfm";
import { useGetRecipeReadmeByName } from "@/recipe/hooks/useGetRecipeReadmeByName";
import useRecipeContext from "@/recipe/hooks/useRecipeContext";
import { useGetRecipeByName } from "@/recipe/hooks/useGetRecipeByName";

export default function RecipeReadme() {
  const { recipeName } = useRecipeContext();
  const { data: recipe } = useGetRecipeByName(recipeName);
  const { data: readme } = useGetRecipeReadmeByName(recipe?.name);

  if (!recipe) {
    return null;
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex justify-between w-full">
        <UserLink address={recipe.creator} />
        <Badge className="bg-secondary">{recipe.publish_state}</Badge>
      </div>
      <div className="prose w-full max-w-full">
        <Markdown remarkPlugins={[remarkGfm]}>{readme?.toString()}</Markdown>
      </div>
    </div>
  );
}
