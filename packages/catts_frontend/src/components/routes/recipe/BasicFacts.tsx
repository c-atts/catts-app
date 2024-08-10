import { formatDistance } from "date-fns";
import useRecipeContext from "@/recipe/hooks/useRecipeContext";
import Keywords from "./Keywords";
import CopyButton from "@/components/CopyButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetRecipeByName } from "@/recipe/hooks/useGetRecipeByName";

export default function BasicFacts() {
  const { recipeName } = useRecipeContext();
  const { data: recipe } = useGetRecipeByName(recipeName);

  if (!recipe) {
    return null;
  }

  const {
    id,
    name,
    display_name,
    description,
    created,
    keywords,
    resolver,
    revokable,
  } = recipe;

  const createdDate = new Date(created);
  const when = formatDistance(new Date(createdDate), new Date(), {
    addSuffix: true,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{display_name || name}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
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
      </CardContent>
    </Card>
  );
}
