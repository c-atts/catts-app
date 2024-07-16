import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";

import Button from "../../../components/ui/Button";
import { useState } from "react";
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
  const [showDetails, setShowDetails] = useState(false);
  if (!selectedRecipe) {
    return null;
  }

  const { queries, processor, schema } = selectedRecipe;

  // if (
  //   !queries[0] ||
  //   !query_variables[0] ||
  //   !query_settings[0] ||
  //   !processor[0] ||
  //   !output_schema[0]
  // ) {
  //   return null;
  // }

  const faChevron = showDetails ? faChevronUp : faChevronDown;

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
      {showDetails && (
        <div className="flex flex-col gap-3 prose-l">
          <h2 className="prose-lg">Queries</h2>
          <pre className="w-full p-3 overflow-x-auto text-sm border border-zinc-500 text-zinc-300">
            {formattedQueries}
          </pre>
          <h2 className="prose-lg">Query variables</h2>
          <pre className="w-full p-3 overflow-x-auto text-sm border border-zinc-500 text-zinc-300">
            {formattedQueryVariables}
          </pre>
          <h2 className="prose-lg">Query settings</h2>
          <h2 className="prose-lg">Processor</h2>
          <pre className="w-full p-3 overflow-x-auto text-sm border border-zinc-500 text-zinc-300">
            {processor[0]
              .split("\n")
              .map((line) => line.trim())
              .join("\n")}
          </pre>
          <h2 className="prose-lg">Output Schema</h2>
          <pre className="w-full p-3 overflow-x-auto text-sm border border-zinc-500 text-zinc-300">
            {JSON.stringify(schema, null, 2)}
          </pre>
        </div>
      )}
      <div>
        <Button
          icon={faChevron}
          onClick={() => setShowDetails(!showDetails)}
          variant="outline"
        >
          {showDetails ? "Hide details" : "Show details"}
        </Button>
      </div>
    </div>
  );
}
