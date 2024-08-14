import HelpTooltip from "@/components/HelpTooltip";
import { Button } from "@/components/ui/button";
import { useCreateSchema } from "@/lib/eas/hooks/useCreateSchema";
import { useGetRecipeByName } from "@/recipe/hooks/useGetRecipeByName";
import useRecipeContext from "@/recipe/hooks/useRecipeContext";
import { runStateStore } from "@/run/RunStateStore";
import { useSelector } from "@xstate/store/react";
import { LoaderCircle } from "lucide-react";
import { useAccount } from "wagmi";

export default function CreateSchema() {
  const { recipeName } = useRecipeContext();
  const { data: recipe } = useGetRecipeByName(recipeName);
  const { loadSchemaStatus, createSchemaStatus, errorMessage } = useSelector(
    runStateStore,
    (state) => state.context,
  );
  const { chain } = useAccount();
  const {
    mutate: createSchema,
    isPending,
    isError,
    error: createError,
  } = useCreateSchema({
    schema: recipe?.schema,
    onSuccess: async () => {
      runStateStore.send({
        type: "transition",
        step: "createSchemaStatus",
        status: "success",
      });
    },
  });

  if (isPending) {
    return (
      <div className="flex justify-between w-full pl-10">
        <div>Creating schema...</div>
        <div>
          <LoaderCircle className="w-5 h-5 animate-spin" />
        </div>
      </div>
    );
  }

  if (createSchemaStatus === "error") {
    return (
      <div className="flex justify-between w-full pl-10">
        <div>Error: {errorMessage || "Error creating schema"}</div>
        <div>🔴</div>
      </div>
    );
  }

  if (isError) {
    const message =
      "shortMessage" in createError
        ? (createError.shortMessage as string)
        : "Error creating schema";

    return (
      <div className="flex justify-between w-full pl-10">
        <div>Error: {message || "Error creating schema"}</div>
        <div>🔴</div>
      </div>
    );
  }

  if (loadSchemaStatus === "error" && createSchemaStatus !== "success") {
    return (
      <div className="flex flex-col gap-3">
        <div className="pl-10">
          An attestation schema for this recipe is not yet available on{" "}
          <b>{chain?.name}</b>.
          <HelpTooltip>
            <p>
              Schemas define the structure and type of data that can be included
              in an attestation. They act as a blueprint for the information
              being attested to, ensuring consistency and clarity.
            </p>
            <p>
              A recipe schema only needs to be created once per supported chain.
            </p>
            <p>
              <a
                className="classic-link"
                href="https://docs.attest.org/docs/core--concepts/schemas"
                rel="noreferrer"
                target="_blank"
              >
                Learn more about EAS schemas
              </a>
            </p>
          </HelpTooltip>
        </div>
        <div className="flex w-full pl-10">
          <Button onClick={() => createSchema()} size="sm">
            Create schema
          </Button>
        </div>
      </div>
    );
  }

  if (createSchemaStatus === "success") {
    return (
      <div className="flex justify-between w-full pl-10">
        <div>Schema created</div>
        <div>✅</div>
      </div>
    );
  }
}
