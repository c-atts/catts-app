import Button from "../ui/Button";
import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";
import { isChainIdSupported } from "../../wagmi/is-chain-id-supported";
import { useAccount } from "wagmi";
import { useSiweIdentity } from "ic-use-siwe-identity";

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
    return "Sign in";
  };

  const icon = isLoggingIn || isPreparingLogin ? faCircleNotch : undefined;

  const disabled = isLoggingIn || !isConnected || isPreparingLogin;

  return (
    <Button
      className="w-44"
      disabled={disabled}
      icon={icon}
      onClick={login}
      spin
    >
      {text()}
    </Button>
  );
}
