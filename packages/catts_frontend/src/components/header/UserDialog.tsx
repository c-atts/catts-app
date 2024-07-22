import { useAccount, useDisconnect, useEnsName } from "wagmi";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Unplug } from "lucide-react";
import { useSiweIdentity } from "ic-use-siwe-identity";

export function UserDialog({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}) {
  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  const { identity, clear } = useSiweIdentity();

  const { data: ensName } = useEnsName({ address, chainId: 1 });

  return (
    <Dialog onOpenChange={setIsOpen} open={isOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>User</DialogTitle>
        </DialogHeader>
        <h2>Ethereum Account</h2>
        <div className="w-full flex gap-3">
          <div className="bg-muted p-2 rounded-sm flex-grow ">
            <code className="md:whitespace-nowrap text-xs">
              {ensName ?? address}
            </code>
          </div>
          <Button
            onClick={() => {
              setIsOpen(false);
              disconnect();
            }}
            variant="outline"
          >
            <Unplug className="w-4 h-4" />
          </Button>
        </div>
        {identity && (
          <>
            <h2>Internet Identity</h2>
            <div className="w-full flex gap-3">
              <div className="bg-muted p-2 rounded-sm flex-grow ">
                <code className="md:whitespace-nowrap text-xs">
                  {identity?.getPrincipal().toString()}
                </code>
              </div>
              <Button
                onClick={() => {
                  setIsOpen(false);
                  clear();
                }}
                variant="outline"
              >
                <Unplug className="w-4 h-4" />
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
