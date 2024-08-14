import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoaderCircle } from "lucide-react";
import Message from "@/components/Message";
import { useCreateRecipe } from "@/recipe/hooks/useCreateRecipe";
import { useForm } from "@tanstack/react-form";
import { useSiweIdentity } from "ic-use-siwe-identity";

export default function CreateForm() {
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

  const formatError = (error?: string) => {
    if (!error) {
      return "";
    }
    const regex = /(?<=\])(?!$)\s*(?=\w+:)/g;
    return error.replace(regex, "\n\n");
  };

  const disabled = !identity || isPending;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Recipe</CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col gap-5">
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
          <div className="flex flex-col gap-2">
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
                </>
              )}
            </form.Field>
            <div className="flex justify-start w-full">
              <Button disabled={disabled} type="submit">
                {isPending && (
                  <LoaderCircle className="w-5 h-5 mr-2 animate-spin" />
                )}
                {isPending ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </form>
        {createResult && "Err" in createResult && (
          <>
            Error: {createResult.Err.code}, {createResult.Err.message}
            <pre className="w-full p-3 text-sm border text-wrap bg-muted/50">
              {formatError(createResult.Err.details[0]).trim()}
            </pre>
          </>
        )}
      </CardContent>
    </Card>
  );
}
