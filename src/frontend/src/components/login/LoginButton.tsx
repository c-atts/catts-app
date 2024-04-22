import Button from "../ui/Button";
import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";
import { isChainIdSupported } from "../../wagmi/is-chain-id-supported";
import { useAccount } from "wagmi";
import { useSiweIdentity } from "ic-use-siwe-identity";
import { faEthereum } from "@fortawesome/free-brands-svg-icons";

export default function LoginButton() {
  const { isConnected, chainId } = useAccount();
  const { login, isLoggingIn, isPreparingLogin } = useSiweIdentity();

  if (!isChainIdSupported(chainId)) {
    return null;
  }

  const text = () => {
    if (isLoggingIn) {
      return "Signing in";
    }
    if (isPreparingLogin) {
      return "Preparing";
    }
    return "Sign in with Ethereum";
  };

  const icon = isLoggingIn || isPreparingLogin ? faCircleNotch : faEthereum;

  const disabled = isLoggingIn || !isConnected || isPreparingLogin;

  const spin = isLoggingIn || isPreparingLogin;

  return (
    <Button
      className="w-56"
      disabled={disabled}
      icon={icon}
      onClick={login}
      spin={spin}
    >
      {text()}
    </Button>
  );
}
