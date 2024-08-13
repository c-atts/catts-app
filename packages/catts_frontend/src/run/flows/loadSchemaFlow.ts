import { RecipeFull } from "@/recipe/types/recipe.types";
import { runStateStore } from "@/run/RunStateStore";
import { JsonRpcSigner } from "ethers";
import { loadEasSchema } from "@/lib/eas/loadEasSchema";

async function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function loadSchemaFlow({
  recipe,
  signer,
}: {
  recipe: RecipeFull;
  signer: JsonRpcSigner;
}) {
  runStateStore.send({
    type: "transition",
    step: "loadSchemaStatus",
    status: "pending",
  });

  const schema = await loadEasSchema({
    schema: recipe.schema,
    resolver: recipe.resolver,
    signer,
  });

  await wait(500);

  if (!schema) {
    runStateStore.send({
      type: "setError",
      step: "loadSchemaStatus",
      message: "Couldn't load schema.",
    });
    return;
  }

  runStateStore.send({
    type: "transition",
    step: "loadSchemaStatus",
    status: "success",
  });

  return schema;
}
