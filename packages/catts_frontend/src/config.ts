import { createConfig, http } from "wagmi";

import { mainnet, sepolia } from "wagmi/chains";
import { walletConnect } from "wagmi/connectors";

// Tanstack Query
export const GQL_QUERY_STALE_TIME = 1000 * 60 * 30; // 30 minutes

// Ethereum

export const ETH_DEFAULT_CHAIN_ID = 11155111;
export const ETH_PAYMENT_CONTRACT_ADDRESS =
  "0xf4e6652aFF99525b2f38b9A990AA1EB5f42ABdF0";

// Wagmi

const WALLETCONNECT_PROJECT_ID = "fd4fc28c05ffde83e69d8d420d0cf25e";

export const wagmiConfig = createConfig({
  chains: [sepolia, mainnet],
  connectors: [walletConnect({ projectId: WALLETCONNECT_PROJECT_ID })],
  pollingInterval: 2_000,
  transports: {
    [sepolia.id]: http(
      "https://eth-sepolia.g.alchemy.com/v2/fA4yD502lz4utnhMnmZz5Kq4ztHOM1Yg",
    ),
    [mainnet.id]: http(
      "https://eth-mainnet.g.alchemy.com/v2/fA4yD502lz4utnhMnmZz5Kq4ztHOM1Yg",
    ),
  },
});

// C–ATTS attestations can only be created on allowed chains
export const allowedChains: number[] = [sepolia.id];

// Ethererum Attestation Service (EAS)

type EasConfig = {
  id: number;
  address: string;
  registryAddress: string;
  explorerUrl: string;
  graphqlUrl: string;
};

export const EAS_CONFIG: EasConfig[] = [
  {
    id: 11155111, // Ethereum Sepolia
    address: "0xC2679fBD37d54388Ce493F1DB75320D236e1815e",
    registryAddress: "0x0a7E2Ff54e76B8E6659aedc9103FB21c038050D0",
    explorerUrl: "https://sepolia.easscan.org",
    graphqlUrl: "https://sepolia.easscan.org/graphql",
  },
  {
    id: 10, // Optimism
    address: "0x4200000000000000000000000000000000000021",
    registryAddress: "0x4200000000000000000000000000000000000020",
    explorerUrl: "https://optimism.easscan.org",
    graphqlUrl: "https://optimism.easscan.org/graphql",
  },
  {
    id: 8453, // Base
    address: "0x4200000000000000000000000000000000000021",
    registryAddress: "0x4200000000000000000000000000000000000020",
    explorerUrl: "https://base.easscan.org",
    graphqlUrl: "https://base.easscan.org/graphql",
  },
];

// The Graph

export const THEGRAPH_QUERY_PROXY_URL =
  "https://catts-thegraph-query-proxy.kristofer-977.workers.dev";
