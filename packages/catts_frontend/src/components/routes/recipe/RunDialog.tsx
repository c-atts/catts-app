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
import { hexToBytes } from "viem";
import { isChainIdSupported } from "@/lib/wagmi/is-chain-id-supported";
import { useAccount } from "wagmi";
import useCreateRunContext from "@/run/hooks/useCreateRunContext";
import useRecipeContext from "@/recipe/hooks/useRecipeContext";
import { useSiweIdentity } from "ic-use-siwe-identity";
import SimulateRun from "./run-steps/SimulateRun";
import useSimulateRunContext from "@/run/hooks/useSimulateRunContext";
import { useGetRecipeByName } from "@/recipe/hooks/useGetRecipeByName";

export default function RunDialog() {
  const { identity } = useSiweIdentity();
  const { chainId, address } = useAccount();
  const { recipeName } = useRecipeContext();
  const { data: recipe } = useGetRecipeByName(recipeName);
  const { startSimulation, resetSimulation } = useSimulateRunContext();
  const { initPayAndCreateAttestation, inProgress, resetRun, runCreated } =
    useCreateRunContext();

  const handleClick = async () => {
    if (!address || !recipe) {
      return;
    }
    if (!(await startSimulation(address))) {
      return;
    }
    const id = hexToBytes(recipe.id as `0x${string}`);
    initPayAndCreateAttestation(id);
  };

  const disabled =
    !identity ||
    !isChainIdSupported(chainId) ||
    inProgress ||
    recipe?.publish_state !== "Published";

  function onOpenChange(open: boolean) {
    resetSimulation();
    resetRun();
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
          <SimulateRun />
          <CreateRun />
          <PayForRun />
          <CreateAttestation />
        </div>

        <DialogFooter className="justify-end">
          {(inProgress || !runCreated) && (
            <>
              <DialogClose asChild>
                <Button disabled={disabled} type="button" variant="secondary">
                  Cancel
                </Button>
              </DialogClose>
              <Button
                className="mb-4"
                disabled={disabled}
                onClick={handleClick}
              >
                {inProgress ? "Running …" : "Run"}
              </Button>
            </>
          )}
          {!inProgress && runCreated && (
            <DialogClose asChild>
              <Button>Close</Button>
            </DialogClose>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
