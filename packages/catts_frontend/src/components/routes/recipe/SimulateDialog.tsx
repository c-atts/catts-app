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
import { Eye, LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import SimulateRun from "./SimulateRun";
import { isChainIdSupported } from "@/lib/wagmi/is-chain-id-supported";
import { useAccount } from "wagmi";
import { useGetRecipeByName } from "@/recipe/hooks/useGetRecipeByName";
import useRecipeContext from "@/recipe/hooks/useRecipeContext";
import { runStateStore, useIsSimulating } from "@/run/RunStateStore";
import { startSimulateRunFlow } from "@/run/flows/simulateRunFlow";

export default function SimulateDialog() {
  const { recipeName } = useRecipeContext();
  const { data: recipe } = useGetRecipeByName(recipeName);
  const { address, chainId } = useAccount();
  const [simulateAddress, setSimulateAddress] = useState(address);
  const isSimulating = useIsSimulating();

  const disabled = !address || !isChainIdSupported(chainId) || !recipe;

  useEffect(() => {
    setSimulateAddress(address);
  }, [address]);

  function simulate() {
    if (!recipe || !simulateAddress) return;
    startSimulateRunFlow({ recipe, address: simulateAddress });
  }

  function resetSimulation() {
    runStateStore.send({ type: "reset" });
  }

  function handleOpenChange(open: boolean) {
    resetSimulation();
    return open;
  }

  function handleSimulateClick() {
    resetSimulation();
    simulate();
  }

  return (
    <Dialog onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="w-full" disabled={disabled} variant="secondary">
          Simulate
          <Eye className="w-5 h-5 ml-2" />
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[450px] overflow-y-auto max-h-[100vh]">
        <DialogHeader>
          <DialogTitle>Simulate recipe</DialogTitle>
          <DialogDescription>
            Simulating allows you to see the recipe output for any address. The
            simulation is run in a sandbox environment in the browser.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col w-full gap-1.5">
          <Label htmlFor="address">Recipient Eth address</Label>
          <Input
            autoComplete="off"
            name="address"
            onChange={(e) =>
              setSimulateAddress(e.target.value as `0x${string}`)
            }
            onFocus={resetSimulation}
            placeholder="0x..."
            type="text"
            value={simulateAddress}
          />
        </div>
        <SimulateRun />
        <DialogFooter className="justify-end gap-2">
          <DialogClose asChild>
            <Button variant="secondary">Cancel</Button>
          </DialogClose>
          <Button disabled={disabled} onClick={handleSimulateClick}>
            {isSimulating && (
              <LoaderCircle className="w-5 h-5 mr-2 animate-spin" />
            )}
            {isSimulating ? "Simulating..." : "Simulate"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
