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

export default function RecipeDetails() {
  const { recipeName } = useRecipeContext();
  const { data: recipe } = useGetRecipeByName(recipeName);
  if (!recipe) {
    return null;
  }

  const { queries, processor, schema } = recipe;

  const { data: parsedQueries } = recipeQueriesSchema.safeParse(queries);

  const formattedQueryVariables = parsedQueries
    ? parsedQueries.map((q) => JSON.stringify(JSON.parse(q.variables), null, 2))
    : "";

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
            <pre className="w-full p-3 overflow-x-auto text-sm text-card-foreground border bg-muted/50">
              {q.endpoint}
            </pre>
            <pre className="w-full p-3 overflow-x-auto text-sm text-card-foreground border bg-muted/50">
              {formatGraphQLQuery(q.query)}
            </pre>
          </div>
        ))}
      <h2>Query variables</h2>
      <pre className="w-full p-3 overflow-x-auto text-sm border text-card-foreground bg-muted/50">
        {formattedQueryVariables}
      </pre>
      <h2>Processor</h2>
      <pre className="w-full p-3 overflow-x-auto text-sm border text-card-foreground bg-muted/50">
        {processor}
      </pre>
    </div>
  );
}
