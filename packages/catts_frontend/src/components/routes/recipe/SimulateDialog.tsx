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

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import SimulateRun from "./SimulateRun";
import { isChainIdSupported } from "@/lib/wagmi/is-chain-id-supported";
import { useAccount } from "wagmi";
import useRecipeContext from "@/recipe/hooks/useRecipeContext";
import { useSiweIdentity } from "ic-use-siwe-identity";
import { useState } from "react";
import useSimulateRunContext from "@/run/hooks/useSimulateRunContext";

export default function SimulateDialog() {
  const { recipe } = useRecipeContext();
  const { identity } = useSiweIdentity();
  const { address, chainId } = useAccount();
  const { startSimulation, resetSimulation, isSimulating } =
    useSimulateRunContext();
  const [simulateForAddress, setSimulateForAddress] = useState<string>(
    (address as string) || "",
  );

  const disabled =
    !identity ||
    !isChainIdSupported(chainId) ||
    !recipe ||
    !simulateForAddress ||
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
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="address">Recipient Eth address</Label>
          <Input
            autoComplete="off"
            name="address"
            onChange={(e) => setSimulateForAddress(e.target.value)}
            onFocus={resetSimulation}
            placeholder="0x..."
            type="text"
            value={simulateForAddress}
          />
        </div>
        <SimulateRun />
        <DialogFooter className="justify-end">
          <DialogClose asChild>
            <Button variant="secondary">Cancel</Button>
          </DialogClose>
          <Button
            disabled={disabled}
            onClick={() => startSimulation(simulateForAddress)}
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
