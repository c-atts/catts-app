import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import useRecipeContext from "@/recipe/hooks/useRecipeContext";
import { Eye, LoaderCircle } from "lucide-react";
import { useState } from "react";
import SimulateRun, { SimulateRunInner } from "./SimulateRun";
import { isChainIdSupported } from "@/lib/wagmi/is-chain-id-supported";
import { Label } from "@/components/ui/label";
import { useAccount } from "wagmi";
import { useSiweIdentity } from "ic-use-siwe-identity";

export default function SimulateDialog() {
  const { recipe } = useRecipeContext();
  const [open, setOpen] = useState(false);
  const { identity } = useSiweIdentity();
  const { address, chainId } = useAccount();

  const [runSimulation, setRunSimulation] = useState(false);
  const [done, setDone] = useState(false);
  const [simulateForAddress, setSimulateForAddress] = useState<string>(
    (address as string) || "",
  );

  const simulate = async () => {
    setRunSimulation(false);
    await new Promise((r) => setTimeout(r, 300));
    setRunSimulation(true);
  };

  const resetSimulation = () => {
    setRunSimulation(false);
  };

  const disabled =
    !identity ||
    !isChainIdSupported(chainId) ||
    !recipe ||
    !simulateForAddress ||
    runSimulation;

  const isPending = runSimulation && !done;

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <Button
        className="w-full"
        onClick={() => setOpen(true)}
        variant="secondary"
      >
        Simulate
        <Eye className="ml-2 h-5 w-5" />
      </Button>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Simulate recipe</DialogTitle>
          <DialogDescription>
            Simulating allows you to see the recipe output for any address. The
            smulation is run in a sandbox environment in the browser.
          </DialogDescription>
        </DialogHeader>
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="address">Recipient Eth address</Label>
          <Input
            name="address"
            onChange={(e) => setSimulateForAddress(e.target.value)}
            onFocus={resetSimulation}
            placeholder="0x..."
            type="text"
            value={simulateForAddress}
          />
        </div>
        {runSimulation && (
          <SimulateRun
            address={simulateForAddress}
            onDone={() => setDone(true)}
          />
        )}
        <DialogFooter className="justify-end">
          <Button
            onClick={() => setOpen(false)}
            type="button"
            variant="secondary"
          >
            Cancel
          </Button>
          <Button disabled={disabled} onClick={simulate}>
            {isPending && (
              <LoaderCircle className="animate-spin mr-2 w-5 h-5" />
            )}
            {isPending ? "Simulating..." : "Simulate"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
