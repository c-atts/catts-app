import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";

import Button from "../../../components/ui/Button";
import useRunContext from "../../../ run-context/useRunContext";
import { useState } from "react";

export default function RecipeDetails() {
  const { selectedRecipe } = useRunContext();
  const [showDetails, setShowDetails] = useState(false);
  if (!selectedRecipe) {
    return null;
  }

  const { queries, query_variables, output_schema } = selectedRecipe;

  const faChevron = showDetails ? faChevronUp : faChevronDown;

  return (
    <div className="flex flex-col gap-5">
      {showDetails && (
        <div className="flex flex-col gap-3 prose-l">
          <h2 className="prose-lg">Queries</h2>
          <pre className="w-full p-3 overflow-x-auto text-sm border border-zinc-500">
            {JSON.stringify(queries, null, 2)}
          </pre>
          <h2 className="prose-lg">Query variables</h2>
          <pre className="w-full p-3 overflow-x-auto text-sm border border-zinc-500">
            [{JSON.stringify(JSON.parse(query_variables[0]), null, 2)}]
          </pre>
          <h2 className="prose-lg">Output Schema</h2>
          <pre className="w-full p-3 overflow-x-auto text-sm border border-zinc-500">
            {JSON.stringify(output_schema, null, 2)}
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
