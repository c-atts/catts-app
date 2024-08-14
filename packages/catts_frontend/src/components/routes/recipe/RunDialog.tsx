import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { CirclePlay } from "lucide-react";
import CreateAttestation from "./run-steps/CreateAttestation";
import CreateRun from "./run-steps/CreateRun";
import PayForRun from "./run-steps/PayForRun";
import { isChainIdSupported } from "@/lib/wagmi/is-chain-id-supported";
import { useAccount } from "wagmi";
import useRecipeContext from "@/recipe/hooks/useRecipeContext";
import { useSiweIdentity } from "ic-use-siwe-identity";
import SimulateRun from "./run-steps/SimulateRun";
import { useGetRecipeByName } from "@/recipe/hooks/useGetRecipeByName";
import LoadSchema from "./run-steps/LoadSchema";
import { useEthersSigner } from "@/lib/ethers/hooks/useEthersSigner";
import { runStateStore, useIsInProgress } from "@/run/RunStateStore";
import { useSelector } from "@xstate/store/react";
import { useActor } from "@/lib/ic/ActorProvider";
import { startCreateRunFlow } from "@/run/flows/createRunFlow";
import { startSimulateRunFlow } from "@/run/flows/simulateRunFlow";
import { loadSchemaFlow } from "@/run/flows/loadSchemaFlow";
import { createSchemaFlow } from "@/run/flows/createSchemaFlow";
import { triggerReindexing } from "@/lib/supabase/triggerReindexing";
import { useQueryClient } from "@tanstack/react-query";

export default function RunDialog() {
  const { identity } = useSiweIdentity();
  const { chainId, address } = useAccount();
  const { recipeName } = useRecipeContext();
  const { data: recipe } = useGetRecipeByName(recipeName);
  const signer = useEthersSigner();
  const { actor } = useActor();
  const inProgress = useIsInProgress();
  const queryClient = useQueryClient();

  const { runInProgress } = useSelector(
    runStateStore,
    (state) => state.context,
  );

  async function triggerReindexingAndInvaliadate() {
    await triggerReindexing();
    queryClient.invalidateQueries({
      queryKey: ["runs"],
    });
  }

  async function handleRunClick() {
    if (!address || !recipe || !signer || !actor || !chainId) {
      return null;
    }

    if (!(await loadSchemaFlow({ recipe, signer }))) {
      if (!(await createSchemaFlow())) {
        return;
      }
    }

    if (!(await startSimulateRunFlow({ recipe, address }))) {
      return;
    }

    await startCreateRunFlow({ recipe, actor, chainId });

    await triggerReindexingAndInvaliadate();
  }

  const disabled =
    !identity ||
    !isChainIdSupported(chainId) ||
    inProgress ||
    recipe?.publish_state !== "Published";

  function onOpenChange(open: boolean) {
    runStateStore.send({ type: "reset" });
    triggerReindexingAndInvaliadate();
    return open;
  }

  return (
    <Dialog onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="w-full" disabled={disabled}>
          Run
          <CirclePlay className="w-5 h-5 ml-2" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Run recipe</DialogTitle>
          <DialogDescription>
            Running a the recipe will create an attestation for the currently
            connected address if the recipe run is successful.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-5">
          <LoadSchema />
          <SimulateRun />
          <CreateRun />
          <PayForRun />
          <CreateAttestation />
        </div>

        <DialogFooter className="justify-end">
          {(inProgress || !runInProgress) && (
            <>
              <DialogClose asChild>
                <Button disabled={disabled} type="button" variant="secondary">
                  Cancel
                </Button>
              </DialogClose>
              <Button
                className="mb-4"
                disabled={disabled}
                onClick={handleRunClick}
              >
                {inProgress ? "Running …" : "Run"}
              </Button>
            </>
          )}
          {!inProgress && runInProgress && (
            <DialogClose asChild>
              <Button>Close</Button>
            </DialogClose>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
