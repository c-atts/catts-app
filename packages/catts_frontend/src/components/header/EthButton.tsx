import { useAccount, useEnsName } from "wagmi";

import { Button } from "@/components/ui/button";
import ConnectDialog from "./ConnectDialog";
import { shortenEthAddress } from "../../eth/utils/shortenEthAddress";
import { useState } from "react";
import { UserDialog } from "./UserDialog";

export default function EthButton() {
  const { address, isConnected, isConnecting } = useAccount();
  const [connectDialogOpen, setConnectDialogOpen] = useState(false);
  const [accountDialogOpen, setAccountDialogOpen] = useState(false);
  const { data: ensName } = useEnsName({
    address: address as `0x${string}`,
    chainId: 1,
  });

  if (!isConnected) return null;

  const handleClick = () => {
    if (isConnected) {
      setAccountDialogOpen(true);
    } else {
      setConnectDialogOpen(true);
    }
  };

  const buttonText = () => {
    if (isConnecting) {
      return "Connecting...";
    }
    if (isConnected) {
      return ensName ?? shortenEthAddress(address);
    }
    return "Connect";
  };

  return (
    <>
      <Button onClick={handleClick}>{buttonText()}</Button>
      <ConnectDialog
        isOpen={connectDialogOpen}
        setIsOpen={setConnectDialogOpen}
      />
      <UserDialog isOpen={accountDialogOpen} setIsOpen={setAccountDialogOpen} />
    </>
  );
}
