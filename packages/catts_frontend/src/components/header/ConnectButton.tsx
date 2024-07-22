import { Button } from "@/components/ui/button";
import { useAccount } from "wagmi";
import { useState } from "react";
import ConnectDialog from "./ConnectDialog";
import { LoaderCircle } from "lucide-react";

export default function ConnectButton() {
  const { isConnecting, isConnected } = useAccount();
  const [connectDialogOpen, setConnectDialogOpen] = useState(false);

  if (isConnected) return null;

  const handleClick = () => {
    if (isConnecting) return;
    setConnectDialogOpen(true);
  };

  const buttonText = isConnecting ? "Connecting" : "Connect wallet";

  return (
    <>
      <Button disabled={isConnecting} onClick={handleClick}>
        {isConnecting ? (
          <LoaderCircle className="mr-2 w-4 h-4 animate-spin" />
        ) : (
          <img className="w-4 h-4 mr-2" src="/ethereum-white.svg" />
        )}
        {buttonText}
      </Button>
      <ConnectDialog
        isOpen={connectDialogOpen}
        setIsOpen={setConnectDialogOpen}
      />
    </>
  );
}
