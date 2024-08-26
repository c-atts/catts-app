import { Network } from "alchemy-sdk";

export function chainIdToNetwork(chainId: number): Network {
  switch (chainId) {
    case 10:
      return Network.OPT_MAINNET;
    case 1:
      return Network.ETH_MAINNET;
    case 42161:
      return Network.ARB_MAINNET;
    case 11155111:
      return Network.ETH_SEPOLIA;
    case 8453:
      return Network.BASE_MAINNET;
    default:
      throw new Error(`Unsupported chain ID: ${chainId}`);
  }
}
