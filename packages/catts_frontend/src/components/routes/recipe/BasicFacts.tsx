import useRecipeContext from "@/recipe/hooks/useRecipeContext";
import Keywords from "./Keywords";
import CopyButton from "@/components/CopyButton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useGetRecipeByName } from "@/recipe/hooks/useGetRecipeByName";
import { formatDistance } from "date-fns";

export default function BasicFacts() {
  const { recipeName } = useRecipeContext();
  const { data: recipe } = useGetRecipeByName(recipeName);

  if (!recipe) {
    return null;
  }

  const { id, name, description, created, keywords, resolver, revokable } =
    recipe;

  const createdDate = new Date(created);
  const when = formatDistance(new Date(createdDate), new Date(), {
    addSuffix: true,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{name}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex flex-col w-full gap-2 text-sm">
          <div className="flex w-full">
            <div className="w-1/4 text-foreground/50 flex items-center">
              Recipe Id:
            </div>
            <div className="w-3/4 flex items-center ml-2">
              {id} <CopyButton className="ml-1" value={id} />
            </div>
          </div>
          <div className="flex w-full">
            <div className="w-1/4 text-foreground/50">Created:</div>
            <div className="w-3/4 ml-2">{when}</div>
          </div>
          <div className="flex w-full items-center">
            <div className="w-1/4 text-foreground/50 mt-1">Keywords:</div>
            <div className="w-3/4 ml-2">
              <Keywords keywords={keywords} />
            </div>
          </div>
          {resolver !== "0x0000000000000000000000000000000000000000" && (
            <div className="flex w-full">
              <div className="w-1/4 text-foreground/50 flex items-center">
                Resolver:
              </div>
              <div className="w-3/4 flex items-center ml-2">
                {resolver} <CopyButton className="ml-1" value={resolver} />
              </div>
            </div>
          )}
          <div className="flex w-full">
            <div className="w-1/4 text-foreground/50">Revokable:</div>
            <div className="w-3/4 ml-2">{revokable ? "Yes" : "No"}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
