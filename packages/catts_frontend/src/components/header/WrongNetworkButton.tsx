import { useAccount, useSwitchChain } from "wagmi";

import Button from "../ui/Button";
import { ETH_DEFAULT_CHAIN_ID } from "../../config";
import { faWaveSquare } from "@fortawesome/free-solid-svg-icons";
import { isChainIdSupported } from "../../wagmi/is-chain-id-supported";

export default function WrongNetworkButton() {
  const { isConnected, chainId } = useAccount();
  const { switchChain } = useSwitchChain();

  const handleClick = () => {
    switchChain({ chainId: ETH_DEFAULT_CHAIN_ID });
  };

  if (!isConnected || isChainIdSupported(chainId)) {
    return null;
  }

  return (
    <>
      <Button
        className="bg-red-800 hover:bg-red-700"
        icon={faWaveSquare}
        onClick={handleClick}
        variant="dark"
      >
        Wrong Network
      </Button>
    </>
  );
}
