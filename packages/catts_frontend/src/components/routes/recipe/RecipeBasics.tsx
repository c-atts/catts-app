import { formatDistance } from "date-fns";
import { Badge } from "@/components/ui/badge";
import useRecipeContext from "@/recipe/hooks/useRecipeContext";
import UserLink from "@/components/UserLink";
import Keywords from "./Keywords";
import CopyButton from "@/components/CopyButton";

export default function RecipeBasics() {
  const { recipe } = useRecipeContext();

  if (!recipe) {
    return null;
  }

  const {
    id,
    name,
    display_name,
    description,
    creator,
    created,
    publish_state,
    keywords,
    resolver,
    revokable,
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

      <div className="flex flex-col w-full gap-2 text-sm">
        <div className="flex w-full">
          <div className="w-1/4 text-foreground/50 flex items-center">
            Recipe Id:
          </div>
          <div className="w-3/4 flex items-center">
            {id} <CopyButton className="ml-1" value={id} />
          </div>
        </div>
        <div className="flex w-full">
          <div className="w-1/4 text-foreground/50">Created:</div>
          <div className="w-3/4">{when}</div>
        </div>
        <div className="flex w-full">
          <div className="w-1/4 text-foreground/50">Keywords:</div>
          <div className="w-3/4">
            <Keywords keywords={keywords} />
          </div>
        </div>
        {resolver !== "0x0000000000000000000000000000000000000000" && (
          <div className="flex w-full">
            <div className="w-1/4 text-foreground/50 flex items-center">
              Resolver:
            </div>
            <div className="w-3/4 flex items-center">
              {resolver} <CopyButton className="ml-1" value={resolver} />
            </div>
          </div>
        )}
        <div className="flex w-full">
          <div className="w-1/4 text-foreground/50">Revokable:</div>
          <div className="w-3/4">{revokable ? "Yes" : "No"}</div>
        </div>
      </div>
    </div>
  );
}
