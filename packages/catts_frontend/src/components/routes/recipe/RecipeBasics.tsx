import { formatDistance } from "date-fns";
import { Badge } from "@/components/ui/badge";
import useRecipeContext from "@/recipe/hooks/useRecipeContext";
import UserLink from "@/components/UserLink";

export default function RecipeBasics() {
  const { recipe } = useRecipeContext();

  if (!recipe) {
    return null;
  }

  const {
    name,
    display_name,
    description,
    creator,
    created,
    publish_state,
    keywords,
  } = recipe;

  const createdDate = new Date(created);
  const when = formatDistance(new Date(createdDate), new Date(), {
    addSuffix: true,
  });

  return (
    <div className="flex flex-col gap-3">
      <div className="flex w-full justify-between">
        <UserLink address={creator} />
        <Badge className="bg-secondary">{publish_state}</Badge>
      </div>
      <h1>{display_name || name}</h1>
      <div className="leading-relaxed">{description}</div>
      <div className="text-sm text-foreground/50">Created {when}</div>
      <div>Keywords</div>
      <div>{keywords && keywords.join(", ")}</div>
    </div>
  );
}
