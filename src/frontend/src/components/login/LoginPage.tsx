import ConnectButton from "./ConnectButton";
import EthButton from "../header/EthButton";
import LoginButton from "./LoginButton";
import WrongNetworkButton from "../header/WrongNetworkButton";
import toast from "react-hot-toast";
import { useAccount } from "wagmi";
import { useEffect } from "react";
import { useSiweIdentity } from "ic-use-siwe-identity";

const LoginCard = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="border-zinc-700/50 border-[1px] bg-zinc-900 drop-shadow-xl rounded-3xl flex flex-col items-center p-10 text-center">
      {children}
    </div>
  );
};

export default function LoginPage(): React.ReactElement {
  const { isConnected, address } = useAccount();
  const { prepareLogin, isPrepareLoginIdle, prepareLoginError, loginError } =
    useSiweIdentity();

  /**
   * Preload a Siwe message on every address change.
   */
  useEffect(() => {
    if (!isPrepareLoginIdle || !isConnected || !address) return;
    prepareLogin();
  }, [isConnected, address, prepareLogin, isPrepareLoginIdle]);

  /**
   * Show an error toast if the prepareLogin() call fails.
   */
  useEffect(() => {
    if (prepareLoginError) {
      toast.error(prepareLoginError.message, {
        position: "bottom-right",
      });
    }
  }, [prepareLoginError]);

  /**
   * Show an error toast if the login call fails.
   */
  useEffect(() => {
    if (loginError) {
      toast.error(loginError.message, {
        position: "bottom-right",
      });
    }
  }, [loginError]);

  return (
    <div>
      <div className="flex flex-col justify-between w-full gap-10 p-5 md:flex-row">
        <div className="hidden text-xl font-bold text-center md:block">
          C–ATTS
        </div>
        <div className="flex flex-col items-center justify-center gap-5 text-sm md:text-base md:flex-row">
          <EthButton />
        </div>
        <div className="block text-xl font-bold text-center md:hidden">
          C–ATTS
        </div>
      </div>

      <div className="flex flex-col items-center justify-center w-full h-screen gap-10">
        <div className="md:w-[750px] border-zinc-700/50 border-[1px] bg-zinc-900 drop-shadow-xl rounded-3xl flex flex-col items-center p-10">
          <div className="flex flex-col w-full gap-10">
            <div className="flex flex-col items-center w-full gap-2">
              <div className="text-3xl font-bold">
                Login to <span className="text-theme-400">C–ATTS</span>
              </div>
            </div>
            <div className="flex items-center w-full gap-5">
              <LoginCard>Move attestations!</LoginCard>
              <LoginCard>Transform attestations!</LoginCard>
              <LoginCard>Combine attestations!</LoginCard>
            </div>
            <div className="flex items-center justify-center w-full gap-5">
              <div>
                <ConnectButton />
                <WrongNetworkButton />
                <LoginButton />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
