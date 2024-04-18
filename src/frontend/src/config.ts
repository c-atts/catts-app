// Ethereum

export const ETH_PAYMENT_CONTRACT_ADDRESS =
  "0xf4e6652aFF99525b2f38b9A990AA1EB5f42ABdF0";

// Wagmi

export const ETH_DEFAULT_CHAIN_ID = 11155111;

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
];