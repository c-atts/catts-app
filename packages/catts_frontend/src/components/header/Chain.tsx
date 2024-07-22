import { useAccount, useSwitchChain } from "wagmi";
import { useEffect } from "react";

import toast from "react-hot-toast";
import { ChainIcon } from "../ChainIcon";
import { isChainIdSupported } from "../../wagmi/is-chain-id-supported";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "../ui/button";
import { ChevronDown, ChevronUp, LoaderCircle } from "lucide-react";

export function Chain() {
  const { chain: connectedChain } = useAccount();

  const {
    chains: supportedChains,
    switchChain,
    isPending,
    error,
  } = useSwitchChain();

  useEffect(() => {
    if (error) {
      toast.error(error.message);
    }
  }, [error]);

  if (isPending) {
    return (
      <Button disabled>
        <LoaderCircle className="w-4 h-4 animate-spin" />
      </Button>
    );
  }

  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant={connectedChain ? "outline" : "default"}>
            {connectedChain ? (
              <>
                <ChainIcon
                  chainName={connectedChain.name}
                  className="h-5 w-5"
                />
                <ChevronDown className="h-4 w-4 ml-2" />
              </>
            ) : (
              "Select Network"
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuRadioGroup
            onValueChange={(chainId) => {
              if (!connectedChain) {
                switchChain({ chainId: parseInt(chainId) });
              } else if (chainId !== connectedChain.id.toString()) {
                switchChain({ chainId: parseInt(chainId) });
              }
            }}
            value={connectedChain && connectedChain.id.toString()}
          >
            {supportedChains.map((chainOption) => {
              return isChainIdSupported(chainOption.id) ? (
                <DropdownMenuRadioItem
                  key={chainOption.id}
                  value={chainOption.id.toString()}
                >
                  <ChainIcon
                    chainName={chainOption.name}
                    className="h-4 w-4 mr-2"
                  />
                  {chainOption.name}
                </DropdownMenuRadioItem>
              ) : null;
            })}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
