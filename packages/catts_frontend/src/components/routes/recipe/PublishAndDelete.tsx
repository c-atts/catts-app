import { useAccount } from "wagmi";
import DeleteDialog from "./DeleteDialog";
import PublishDialog from "./PublishDialog";
import useRecipeContext from "@/recipe/hooks/useRecipeContext";
import { useSiweIdentity } from "ic-use-siwe-identity";

export default function PublishAndDelete() {
  const { recipe } = useRecipeContext();
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
    <div className="flex w-full bg-muted/50 rounded-t-lg items-center p-5 mb-5">
      <div>
        This recipe has not yet been published. You can share the recipe link
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
