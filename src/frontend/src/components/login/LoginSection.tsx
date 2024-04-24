import ConnectButton from "./ConnectButton";
import LoginButton from "./LoginButton";
import toast from "react-hot-toast";
import { useEffect } from "react";
import { useSiweIdentity } from "ic-use-siwe-identity";
import Section from "../ui/Section";

export default function LoginSection(): React.ReactElement {
  const { prepareLoginError, loginError } = useSiweIdentity();

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
    <Section>
      <div className="flex flex-col items-center w-full gap-5">
        <div>
          <h1 className="text-center text-theme-400">C–ATTS</h1>
          <div className="text-center">
            <h3>Move, transform and combine attestations!</h3>
          </div>
          <p className="text-lg leading-8 text-center text-zinc-400">
            Composite attestations are a new type of attestation combining data
            from multiple sources to form a unified and verifiable credential.
          </p>
          <p className="text-lg leading-8 text-center text-zinc-400">
            This is an early demo of what is possible using C–ATTS. Sign in with
            your Ethereum wallet to get started simulating and creating
            composite attestations.
          </p>
        </div>
        <ConnectButton />
        <LoginButton />
      </div>
    </Section>
  );
}
