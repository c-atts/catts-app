import { Button } from "@/components/ui/button";
import DeleteDialog from "./DeleteDialog";

export default function PublishAndDelete() {
  return (
    <div className="flex w-full bg-muted/50 rounded-t-lg items-center p-5 mb-5">
      <div>
        This recipe has not yet been published. You can share the recipe link
        with others and run simulations. No attestation can be created from a
        draft recipe. To make changes, upload a new version.
      </div>
      <div className="flex justify-end w-full gap-2">
        <DeleteDialog />
        <Button>Publish</Button>
      </div>
    </div>
  );
}
