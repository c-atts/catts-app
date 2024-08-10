import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useDeleteRecipe } from "@/recipe/hooks/useDeleteRecipe";
import { useGetRecipeByName } from "@/recipe/hooks/useGetRecipeByName";
import useRecipeContext from "@/recipe/hooks/useRecipeContext";
import { LoaderCircle } from "lucide-react";

export default function DeleteDialog() {
  const { mutate: deleteRecipe, isPending } = useDeleteRecipe();
  const { recipeName } = useRecipeContext();
  const { data: recipe } = useGetRecipeByName(recipeName);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive">Delete</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete recipe</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this recipe? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="justify-end">
          <DialogClose asChild>
            <Button disabled={isPending} type="button" variant="secondary">
              Cancel
            </Button>
          </DialogClose>
          <Button
            disabled={isPending}
            onClick={() => deleteRecipe({ recipeId: recipe?.id })}
            variant="destructive"
          >
            {isPending && (
              <LoaderCircle className="animate-spin mr-2 w-5 h-5" />
            )}
            {isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
