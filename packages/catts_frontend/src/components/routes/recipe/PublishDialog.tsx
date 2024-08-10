import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { LoaderCircle } from "lucide-react";
import { usePublishRecipe } from "@/recipe/hooks/usePublishRecipe";
import useRecipeContext from "@/recipe/hooks/useRecipeContext";
import { useGetRecipeByName } from "@/recipe/hooks/useGetRecipeByName";

export default function PublishDialog() {
  const {
    mutate: publishRecipe,
    isPending,
    isSuccess,
    isError,
  } = usePublishRecipe();
  const { recipeName } = useRecipeContext();
  const { data: recipe } = useGetRecipeByName(recipeName);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (isError || isSuccess) {
      setOpen(false);
    }
  }, [isError, isSuccess]);

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <Button onClick={() => setOpen(true)}>Publish</Button>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Publish recipe</DialogTitle>
          <DialogDescription>
            Publishing a recipe allows anyone to create attestations based on
            it. After publishing, no more changes can be made to the recipe.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="justify-end">
          <Button
            disabled={isPending}
            onClick={() => setOpen(false)}
            type="button"
            variant="secondary"
          >
            Cancel
          </Button>
          <Button
            disabled={isPending}
            onClick={() => publishRecipe({ recipeId: recipe?.id })}
          >
            {isPending && (
              <LoaderCircle className="w-5 h-5 mr-2 animate-spin" />
            )}
            {isPending ? "Publishing..." : "Publish"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
