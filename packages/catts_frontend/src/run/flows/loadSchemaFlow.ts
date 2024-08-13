import { RecipeFull } from "@/recipe/types/recipe.types";
import { runStateStore } from "@/run/RunStateStore";
import { JsonRpcSigner } from "ethers";
import { loadEasSchema } from "@/lib/eas/loadEasSchema";
import { handleError } from "./util/handleError";

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

  try {
    const schema = await loadEasSchema({
      schema: recipe.schema,
      resolver: recipe.resolver,
      signer,
    });
    if (!schema) {
      throw new Error("Couldn't load schema.");
    }
  } catch (error) {
    handleError(error, "loadSchemaStatus", "Couldn't load schema.");
    return false;
  }

  await wait(500);

  runStateStore.send({
    type: "transition",
    step: "loadSchemaStatus",
    status: "success",
  });

  return true;
}
