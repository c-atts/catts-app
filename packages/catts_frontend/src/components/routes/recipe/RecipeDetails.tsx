import { useGetRecipeByName } from "@/recipe/hooks/useGetRecipeByName";
import useRecipeContext from "@/recipe/hooks/useRecipeContext";
import { recipeQueriesSchema } from "@/recipe/types/recipe.types";

function formatGraphQLQuery(query: string): string {
  // Normalize spaces and remove unnecessary spaces before and after braces
  let formatted = query
    .replace(/\s*\{\s*/g, " { ")
    .replace(/\s*\}\s*/g, " } ")
    .trim();

  // Break before any '{' and after any '}', and ensure space around the parentheses
  formatted = formatted.replace(/(\s*\{\s*)|(\s*\}\s*)/g, "\n$&\n");

  // Split the formatted string into lines for further processing
  const lines = formatted.split("\n").filter((line) => line.trim() !== "");

  // Manage indentation
  let indentLevel = 0;
  const indentedLines = lines.map((line) => {
    // Adjust indentation based on the current line content
    if (line.includes("}") && !line.includes("{")) {
      indentLevel--;
    }

    // Create the indented line
    const indentedLine = `${"  ".repeat(indentLevel)}${line.trim()}`;

    // Prepare for the next line
    if (line.includes("{") && !line.includes("}")) {
      indentLevel++;
    }

    return indentedLine;
  });

  return indentedLines.join("\n");
}

function formatVariables(variables: string) {
  return JSON.stringify(JSON.parse(variables), null, 2);
}

export default function RecipeDetails() {
  const { recipeName } = useRecipeContext();
  const { data: recipe } = useGetRecipeByName(recipeName);
  if (!recipe) {
    return null;
  }

  const { queries, processor, schema } = recipe;

  const { data: parsedQueries } = recipeQueriesSchema.safeParse(queries);

  return (
    <div className="prose w-full max-w-full">
      <h2>Output Schema</h2>
      <pre className="w-full p-3 overflow-x-auto text-sm border  text-card-foreground bg-muted/50">
        {JSON.stringify(schema, null, 2)}
      </pre>

      <h2>Queries</h2>
      {parsedQueries &&
        parsedQueries.map((q, index) => (
          <div key={index}>
            <h3>#{index + 1}</h3>
            <h4>URL</h4>
            <pre className="w-full p-3 overflow-x-auto text-sm text-card-foreground border bg-muted/50">
              {q.url}
            </pre>
            {q.headers && (
              <>
                <h4>Headers</h4>
                <pre className="w-full p-3 overflow-x-auto text-sm text-card-foreground border bg-muted/50">
                  {q.headers}
                </pre>
              </>
            )}
            {q.filter && (
              <>
                <h4>Filter</h4>
                <pre className="w-full p-3 overflow-x-auto text-sm text-card-foreground border bg-muted/50">
                  {q.filter}
                </pre>
              </>
            )}
            {q.body && (
              <>
                <h4>GraphQL Query</h4>
                <pre className="w-full p-3 overflow-x-auto text-sm text-card-foreground border bg-muted/50">
                  {formatGraphQLQuery(q.body.query)}
                </pre>
                <h4>GraphQL Variables</h4>
                <pre className="w-full p-3 overflow-x-auto text-sm text-card-foreground border bg-muted/50">
                  {formatVariables(q.body.variables)}
                </pre>
              </>
            )}
          </div>
        ))}
      <h2>Processor</h2>
      <pre className="w-full p-3 overflow-x-auto text-sm border text-card-foreground bg-muted/50">
        {processor}
      </pre>
    </div>
  );
}
