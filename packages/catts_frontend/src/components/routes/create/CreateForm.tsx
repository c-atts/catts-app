import { Button } from "@/components/ui/button";
import { useForm } from "@tanstack/react-form";
import { Section } from "@/components/ui/Section";
import { useCreateRecipe } from "@/recipe/hooks/useCreateRecipe";

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
    <Section>
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
                <label htmlFor={field.name}>URL</label>
                <input
                  id={field.name}
                  name={field.name}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  value={field.state.value}
                />
                {field.state.meta.errors ? (
                  <em>{field.state.meta.errors.join(", ")}</em>
                ) : null}
              </>
            )}
          </form.Field>
          <Button type="submit">{isPending ? "Saving..." : "Save"}</Button>
        </div>
      </form>
      {createResult && "Err" in createResult && (
        <>
          <h2 className="text-2xl text-white font-bold">
            Error: {createResult.Err.code}, {createResult.Err.message}
          </h2>
          <div className="p-3 flex flex-col bg-theme-4 rounded-md">
            <pre className="text-wrap">
              {formatError(createResult.Err.details[0]).trim()}
            </pre>
          </div>
        </>
      )}
    </Section>
  );
}
