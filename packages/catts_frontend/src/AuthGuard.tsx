import React, { useEffect } from "react";

import { useAccount } from "wagmi";
import { useSiweIdentity } from "ic-use-siwe-identity";
import { isChainIdSupported } from "./lib/wagmi/is-chain-id-supported";

type AuthGuardProps = {
  children: React.ReactNode;
};

export default function AuthGuard({ children }: AuthGuardProps) {
  const { isConnected, address } = useAccount();
  const { chainId } = useAccount();
  const { clear, isInitializing, identity, identityAddress } =
    useSiweIdentity();

  // If the user is not connected, clear the session.
  useEffect(() => {
    if (!isConnected && identity) {
      clear();
    }
  }, [isConnected, clear, identity]);

  // If user switches to an unsupported network, clear the session.
  useEffect(() => {
    if (identity && !isChainIdSupported(chainId)) {
      clear();
    }
  }, [chainId, clear, identity]);

  // If the user switches to a different address, clear the session.
  useEffect(() => {
    if (identityAddress && address && address !== identityAddress) {
      clear();
    }
  }, [address, clear, identityAddress]);

  if (isInitializing) {
    return null;
  }

  return <>{children}</>;
}
