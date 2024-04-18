import { createConfig, http } from "wagmi";

import { sepolia } from "wagmi/chains";
import { walletConnect } from "wagmi/connectors";

// Replace with your own WalletConnect project ID
// Register for free at https://walletconnect.com/
const WALLETCONNECT_PROJECT_ID = "fd4fc28c05ffde83e69d8d420d0cf25e";

export const wagmiConfig = createConfig({
  chains: [sepolia],
  connectors: [walletConnect({ projectId: WALLETCONNECT_PROJECT_ID })],
  transports: {
    [sepolia.id]: http(),
  },
});
