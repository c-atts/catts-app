import { Button } from "@/components/ui/button";
import { useAccount, useSwitchChain } from "wagmi";
import { useSiweIdentity } from "ic-use-siwe-identity";
import { ETH_DEFAULT_CHAIN_ID } from "../../config";
import { useState } from "react";
import { LoaderCircle } from "lucide-react";
import { useLogin } from "@/lib/hooks/useLogin";
import { isChainIdSupported } from "@/lib/wagmi/is-chain-id-supported";

export default function LoginButton() {
  const { isConnected, chainId } = useAccount();
  const { isPreparingLogin } = useSiweIdentity();
  const { switchChainAsync } = useSwitchChain();
  const [isSwitchingChain, setIsSwitchingChain] = useState(false);
  const { mutate: login, isPending: isLoggingIn } = useLogin();

  const handleClick = async () => {
    if (!isChainIdSupported(chainId)) {
      setIsSwitchingChain(true);
      try {
        await switchChainAsync({ chainId: ETH_DEFAULT_CHAIN_ID });
      } catch (e) {
        return;
      } finally {
        setIsSwitchingChain(false);
      }
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

  const disabled =
    isSwitchingChain || isLoggingIn || !isConnected || isPreparingLogin;

  return (
    <Button disabled={disabled} onClick={handleClick}>
      {isSwitchingChain || isLoggingIn || isPreparingLogin ? (
        <LoaderCircle className="mr-2 w-4 h-4 animate-spin" />
      ) : (
        <img
          alt="Ethereum Logo"
          className="w-4 h-4 mr-2"
          src="/ethereum-white.svg"
        />
      )}

      {text()}
    </Button>
  );
}
