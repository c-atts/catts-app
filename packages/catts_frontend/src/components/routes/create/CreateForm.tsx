import { Button } from "@/components/ui/button";
import { useForm } from "@tanstack/react-form";
import { useCreateRecipe } from "@/recipe/hooks/useCreateRecipe";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoaderCircle } from "lucide-react";

export default function CreateForm() {
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

  const formatError = (error?: string) => {
    if (!error) {
      return "";
    }
    const regex = /(?<=\])(?!$)\s*(?=\w+:)/g;
    return error.replace(regex, "\n\n");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Recipe</CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col gap-5">
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
                <>
                  <label htmlFor={field.name}>Recipe URL</label>
                  <Input
                    disabled={isPending}
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
                </>
              )}
            </form.Field>
            <div className="flex w-full justify-start">
              <Button disabled={isPending} type="submit">
                {isPending && (
                  <LoaderCircle className="w-5 h-5 animate-spin mr-2" />
                )}
                {isPending ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </form>
        {createResult && "Err" in createResult && (
          <>
            Error: {createResult.Err.code}, {createResult.Err.message}
            <pre className="w-full p-3 text-wrap text-sm border bg-muted/50">
              {formatError(createResult.Err.details[0]).trim()}
            </pre>
          </>
        )}
      </CardContent>
    </Card>
  );
}
