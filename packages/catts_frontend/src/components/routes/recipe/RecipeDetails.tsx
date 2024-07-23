import useRunContext from "../../../context/useRunContext";

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
  const { selectedRecipe } = useRunContext();
  if (!selectedRecipe) {
    return null;
  }

  const { queries, processor, schema } = selectedRecipe;

  const formattedQueries = queries
    .map((q) => formatGraphQLQuery(q.query))
    .join("\n");

  const formattedQueryVariables = JSON.stringify(
    queries.map((q) => JSON.parse(q.variables)),
    null,
    2,
  );

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3">
        <h2>Queries</h2>
        <pre className="w-full p-3 overflow-x-auto text-sm border bg-muted/50">
          {formattedQueries}
        </pre>
        <h2>Query variables</h2>
        <pre className="w-full p-3 overflow-x-auto text-sm border  bg-muted/50">
          {formattedQueryVariables}
        </pre>
        <h2>Query settings</h2>
        <h2>Processor</h2>
        <pre className="w-full p-3 overflow-x-auto text-sm border bg-muted/50">
          {processor
            .split("\n")
            .map((line) => line.trim())
            .join("\n")}
        </pre>
        <h2>Output Schema</h2>
        <pre className="w-full p-3 overflow-x-auto text-sm border bg-muted/50">
          {JSON.stringify(schema, null, 2)}
        </pre>
      </div>
    </div>
  );
}
