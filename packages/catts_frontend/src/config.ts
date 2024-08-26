import { createConfig, http } from "wagmi";

import { mainnet, optimism, sepolia, base, arbitrum } from "wagmi/chains";
import { walletConnect } from "wagmi/connectors";

// Tanstack Query
export const GQL_QUERY_STALE_TIME = 1000 * 60 * 30; // 30 minutes

// Ethereum

export const ETH_DEFAULT_CHAIN_ID = 11155111;

type ChainConfig = {
  name: string;
  paymentContractAddress: string;
  nativeTokenName: string;
  blockExplorerUrl: string;
  easContractAddress: string;
  easRegistryAddress: string;
  easExplorerUrl: string;
  easGraphQLUrl: string;
};

export const CHAIN_CONFIG: { [key: string]: ChainConfig } = {
  [base.id]: {
    name: "Base",
    paymentContractAddress: "0x839ADFdFd2B038C3e4429abe54ac4DBB620a0BD1",
    nativeTokenName: "ETH",
    blockExplorerUrl: "https://basescan.org",
    easContractAddress: "0x4200000000000000000000000000000000000021",
    easRegistryAddress: "0x4200000000000000000000000000000000000020",
    easExplorerUrl: "https://base.easscan.org",
    easGraphQLUrl: "https://base.easscan.org/graphql",
  },
  [arbitrum.id]: {
    name: "Arbitrum One",
    paymentContractAddress: "0x5601FE396f901442b1EAcAE5844431B7A4e2587D",
    nativeTokenName: "ETH",
    blockExplorerUrl: "https://arbiscan.io",
    easContractAddress: "0xbD75f629A22Dc1ceD33dDA0b68c546A1c035c458",
    easRegistryAddress: "0xA310da9c5B885E7fb3fbA9D66E9Ba6Df512b78eB",
    easExplorerUrl: "https://arbitrum.easscan.org",
    easGraphQLUrl: "https://arbitrum.easscan.org/graphql",
  },
  [optimism.id]: {
    name: "OP Mainnet",
    paymentContractAddress: "0x15a9a0f3bf24f9ff438f18f83ecc8b7cb2e15f9a",
    nativeTokenName: "ETH",
    blockExplorerUrl: "https://optimistic.etherscan.io",
    easContractAddress: "0x4200000000000000000000000000000000000021",
    easRegistryAddress: "0x4200000000000000000000000000000000000020",
    easExplorerUrl: "https://optimism.easscan.org",
    easGraphQLUrl: "https://optimism.easscan.org/graphql",
  },
  [sepolia.id]: {
    name: "Sepolia",
    paymentContractAddress: "0xe498539Cad0E4325b88d6F6a1B89af7e4C8dF404",
    nativeTokenName: "SepoliaETH",
    blockExplorerUrl: "https://sepolia.etherscan.io",
    easContractAddress: "0xC2679fBD37d54388Ce493F1DB75320D236e1815e",
    easRegistryAddress: "0x0a7E2Ff54e76B8E6659aedc9103FB21c038050D0",
    easExplorerUrl: "https://sepolia.easscan.org",
    easGraphQLUrl: "https://sepolia.easscan.org/graphql",
  },
};

// Wagmi

const WALLETCONNECT_PROJECT_ID = "fd4fc28c05ffde83e69d8d420d0cf25e";

export const wagmiConfig = createConfig({
  chains: [optimism, sepolia, mainnet, base, arbitrum],
  connectors: [walletConnect({ projectId: WALLETCONNECT_PROJECT_ID })],
  pollingInterval: 2_000,
  transports: {
    [optimism.id]: http(
      "https://opt-mainnet.g.alchemy.com/v2/fA4yD502lz4utnhMnmZz5Kq4ztHOM1Yg",
    ),
    [sepolia.id]: http(
      "https://eth-sepolia.g.alchemy.com/v2/fA4yD502lz4utnhMnmZz5Kq4ztHOM1Yg",
    ),
    [mainnet.id]: http(
      "https://eth-mainnet.g.alchemy.com/v2/fA4yD502lz4utnhMnmZz5Kq4ztHOM1Yg",
    ),
    [base.id]: http(
      "https://base-mainnet.g.alchemy.com/v2/fA4yD502lz4utnhMnmZz5Kq4ztHOM1Yg",
    ),
    [arbitrum.id]: http(
      "https://arb-mainnet.g.alchemy.com/v2/fA4yD502lz4utnhMnmZz5Kq4ztHOM1Yg",
    ),
  },
});

// C–ATTS attestations can only be created on allowed chains
export const allowedChains: number[] = [
  optimism.id,
  sepolia.id,
  base.id,
  arbitrum.id,
];

export type AllowedChainIds = 10 | 11155111 | 8453 | 42161;

// Alchemy

export const ALCHEMY_API_KEY = "fA4yD502lz4utnhMnmZz5Kq4ztHOM1Yg";
