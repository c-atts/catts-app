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
import useSimulateRunContext from "@/run/hooks/useSimulateRunContext";

export default function SimulateDialog() {
  const { recipeName } = useRecipeContext();
  const { data: recipe } = useGetRecipeByName(recipeName);
  const { address, chainId } = useAccount();
  const { startSimulation, resetSimulation, isSimulating } =
    useSimulateRunContext();
  const [simulateAddress, setSimulateAddress] = useState<string>(
    (address as string) || ""
  );

  // Update simulate address when account address changes
  useEffect(() => setSimulateAddress(address as string), [address]);

  const disabled =
    !address ||
    !isChainIdSupported(chainId) ||
    !recipe ||
    !simulateAddress ||
    isSimulating;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="w-full" disabled={disabled} variant="secondary">
          Simulate
          <Eye className="w-5 h-5 ml-2" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
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
            onChange={(e) => setSimulateAddress(e.target.value)}
            onFocus={resetSimulation}
            placeholder="0x..."
            type="text"
            value={simulateAddress}
          />
        </div>
        <SimulateRun />
        <DialogFooter className="justify-end">
          <DialogClose asChild>
            <Button variant="secondary">Cancel</Button>
          </DialogClose>
          <Button
            disabled={disabled}
            onClick={() => startSimulation(simulateAddress)}
          >
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
