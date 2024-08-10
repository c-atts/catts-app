import DeleteDialog from "./DeleteDialog";
import PublishDialog from "./PublishDialog";
import { useAccount } from "wagmi";
import useRecipeContext from "@/recipe/hooks/useRecipeContext";
import { useSiweIdentity } from "ic-use-siwe-identity";
import { useGetRecipeByName } from "@/recipe/hooks/useGetRecipeByName";

export default function PublishAndDelete() {
  const { recipeName } = useRecipeContext();
  const { data: recipe } = useGetRecipeByName(recipeName);
  const { address } = useAccount();
  const { identity } = useSiweIdentity();

  if (
    !identity ||
    recipe?.creator.toLowerCase() !== address?.toLowerCase() ||
    recipe?.publish_state !== "Draft"
  ) {
    return null;
  }

  return (
    <div className="flex items-center w-full p-5 mb-5 rounded-t-lg bg-muted/50">
      <div>
        This recipe has not yet been published. You can share{" "}
        <a
          className="classic-link"
          href={`https://app.catts.run/recipe/${recipe.name}`}
        >
          the link
        </a>{" "}
        with others and run simulations. No attestation can be created from a
        draft recipe. To make changes, upload a new version.
      </div>
      <div className="flex justify-end w-full gap-2">
        <DeleteDialog />
        <PublishDialog />
      </div>
    </div>
  );
}
