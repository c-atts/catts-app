import { Connector, useAccount, useConnect } from "wagmi";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function ConnectDialog({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}) {
  const { connect, connectors, error, isPending, reset } = useConnect();
  const { isConnected } = useAccount();

  useEffect(() => {
    if (isOpen) reset();
  }, [isOpen, reset]);

  const iconSource = (connector: Connector) => {
    // WalletConnect does not provide an icon, so we provide a custom one.
    if (connector.id === "walletConnect") {
      return "/walletconnect.svg";
    }
    return connector.icon;
  };

  return (
    <Dialog onOpenChange={setIsOpen} open={isOpen}>
      <DialogContent className="w-64">
        <DialogHeader>
          <DialogTitle>Connect Wallet</DialogTitle>
          <div className="w-full flex flex-col items-center gap-2">
            {connectors.map((connector) => (
              <Button
                className="justify-between w-52"
                disabled={isConnected || isPending}
                key={connector.id}
                onClick={() => connect({ connector })}
                variant="outline"
              >
                {connector.name}
                <img className="w-4 h-4" src={iconSource(connector)} />
              </Button>
            ))}
            {error && (
              <div className="p-2 text-center text-white bg-red-500">
                {error.message}
              </div>
            )}
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
