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
import { getSchemaUID } from "@ethereum-attestation-service/eas-sdk";
import { Skeleton } from "@/components/ui/skeleton";

function BasicFactsSkeleton() {
  return <Skeleton className="w-full h-[290px] rounded-lg" />;
}

export default function BasicFacts() {
  const { recipeName } = useRecipeContext();
  const { data: recipe, isPending } = useGetRecipeByName(recipeName);

  if (isPending) {
    return <BasicFactsSkeleton />;
  }

  if (!recipe) {
    return null;
  }

  const {
    id,
    name,
    description,
    created,
    keywords,
    resolver,
    revokable,
    schema,
  } = recipe;

  const createdDate = new Date(created);
  const when = formatDistance(new Date(createdDate), new Date(), {
    addSuffix: true,
  });

  const schemaUid = getSchemaUID(schema, resolver, false);

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
              {id.substring(0, 10)} …{id.slice(-8)}
              <CopyButton className="ml-1" value={id} />
            </div>
          </div>
          <div className="flex w-full">
            <div className="w-1/4 text-foreground/50 flex items-center">
              Schema UID:
            </div>
            <div className="w-3/4 flex items-center ml-2">
              {schemaUid.substring(0, 10)} …{schemaUid.slice(-8)}
              <CopyButton className="ml-1" value={schemaUid} />
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
