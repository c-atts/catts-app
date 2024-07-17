import { Button } from "@/components/ui/button";
import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";
import { isChainIdSupported } from "../../wagmi/is-chain-id-supported";
import { useAccount, useSwitchChain } from "wagmi";
import { useSiweIdentity } from "ic-use-siwe-identity";
import { faEthereum } from "@fortawesome/free-brands-svg-icons";
import { ETH_DEFAULT_CHAIN_ID } from "../../config";
import { useState } from "react";
import { useLogin } from "../../catts/hooks/useLogin";

export default function LoginButton() {
  const { isConnected, chainId } = useAccount();
  const { isPreparingLogin } = useSiweIdentity();
  const { switchChainAsync } = useSwitchChain();
  const [isSwitchingChain, setIsSwitchingChain] = useState(false);
  const { mutate: login, isPending: isLoggingIn } = useLogin();

  const handleClick = async () => {
    if (!isChainIdSupported(chainId)) {
      setIsSwitchingChain(true);
      await switchChainAsync({ chainId: ETH_DEFAULT_CHAIN_ID });
      setIsSwitchingChain(false);
    }
    login();
  };

  if (!isConnected) {
    return null;
  }

  const text = () => {
    if (isSwitchingChain) {
      return "Switching chain";
    }
    if (isLoggingIn) {
      return "Signing in";
    }
    if (isPreparingLogin) {
      return "Preparing";
    }
    return "Sign in with Ethereum";
  };

  // const icon =
  //   isSwitchingChain || isLoggingIn || isPreparingLogin
  //     ? faCircleNotch
  //     : faEthereum;

  const disabled =
    isSwitchingChain || isLoggingIn || !isConnected || isPreparingLogin;

  // const spin = isSwitchingChain || isLoggingIn || isPreparingLogin;

  return (
    <Button
      className="w-56"
      disabled={disabled}
      // icon={icon}
      onClick={handleClick}
      // spin={spin}
    >
      {text()}
    </Button>
  );
}
