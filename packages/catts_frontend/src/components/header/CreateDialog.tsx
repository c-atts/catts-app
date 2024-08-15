import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoaderCircle, Plus } from "lucide-react";
import Message from "@/components/Message";
import { useCreateRecipe } from "@/recipe/hooks/useCreateRecipe";
import { useForm } from "@tanstack/react-form";
import { useSiweIdentity } from "ic-use-siwe-identity";
import { cattsErrorResponse } from "@/lib/types/catts-error";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function CreateDialog() {
  const { identity } = useSiweIdentity();
  const {
    mutate: createRecipe,
    isPending,
    data: createResult,
    reset,
  } = useCreateRecipe();
  const form = useForm({
    defaultValues: {
      url: "",
    },
    onSubmit: async ({ value }) => {
      reset();
      createRecipe(value);
    },
  });

  const { data: createError } = cattsErrorResponse.safeParse(createResult);

  const formatError = (error?: string) => {
    if (!error) {
      return "";
    }
    const regex = /(?<=\])(?!$)\s*(?=\w+:)/g;
    return error.replace(regex, "\n\n");
  };

  const disabled = !identity || isPending;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          className="rounded-full hidden lg:flex"
          disabled={!identity}
          size="sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Recipe
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Recipe</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-5">
          A C–ATTS recipe defines the queries and the processing logic needed to
          create a composite attestation.{" "}
          <p>
            Recipes are create and tested locally before being uploaded and
            published onchain. For more details, see the{" "}
            <a
              className="classic-link"
              href="https://docs.catts.run"
              rel="noreferrer"
              target="_blank"
            >
              <nobr>C–ATTS</nobr> documentation
            </a>{" "}
            or the{" "}
            <a
              className="classic-link"
              href="https://github.com/c-atts/catts-recipes"
              rel="noreferrer"
              target="_blank"
            >
              <nobr>C–ATTS</nobr> recipe repository on GitHub
            </a>
            .
          </p>{" "}
          {!identity ? (
            <Message type="note">
              You need to be logged in to create a recipe
            </Message>
          ) : null}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
          >
            <div className="flex flex-col gap-5">
              <form.Field
                name="url"
                validators={{
                  onBlur: ({ value }) => {
                    if (!value) {
                      return "URL is required";
                    }
                    try {
                      new URL(value);
                    } catch (error) {
                      return "Invalid URL";
                    }
                  },
                }}
              >
                {(field) => (
                  <div className="flex flex-col gap-2">
                    <label
                      className="text-sm font-medium leading-none"
                      htmlFor={field.name}
                    >
                      Recipe URL
                    </label>
                    <Input
                      disabled={disabled}
                      id={field.name}
                      name={field.name}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      value={field.state.value}
                    />
                    {Array.isArray(field.state.meta.errors) &&
                    field.state.meta.errors.length > 0 ? (
                      <em>{field.state.meta.errors.join(", ")}</em>
                    ) : null}
                  </div>
                )}
              </form.Field>
              {createError && (
                <>
                  Error: {createError.Err.code}, {createError.Err.message}
                  <pre className="w-full p-3 text-sm border text-wrap bg-muted/50">
                    {formatError(createError.Err.details[0]).trim()}
                  </pre>
                </>
              )}
              <DialogFooter className="justify-end">
                <DialogClose asChild>
                  <Button disabled={disabled} type="button" variant="secondary">
                    Cancel
                  </Button>
                </DialogClose>
                <Button disabled={disabled} type="submit">
                  {isPending && (
                    <LoaderCircle className="w-5 h-5 mr-2 animate-spin" />
                  )}
                  {isPending ? "Uploading..." : "Upload"}
                </Button>
              </DialogFooter>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
