import {
  faCheck,
  faCircleNotch,
  faWaveSquare,
} from "@fortawesome/free-solid-svg-icons";
import { useAccount, useSwitchChain } from "wagmi";
import { useEffect } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Listbox } from "@headlessui/react";
import toast from "react-hot-toast";
import { ChainIcon } from "../ChainIcon";
import { isChainIdSupported } from "../../wagmi/is-chain-id-supported";

export function Chain() {
  const { chain } = useAccount();

  const { chains, switchChain, isPending, error } = useSwitchChain();

  useEffect(() => {
    if (error) {
      toast.error(error.message);
    }
  }, [error]);

  if (!chain) {
    return null;
  }

  if (isPending) {
    return (
      <div className="flex text-zinc-200 rounded-xl px-4 py-2 items-center gap-2 drop-shadow-lg hover:scale-105 disabled:cursor-not-allowed disabled:scale-100 justify-center bg-black hover:bg-gray-950 disabled:text-gray-700">
        <FontAwesomeIcon
          className="w-4 h-4 p-[4px]"
          icon={faCircleNotch}
          spin
        />
      </div>
    );
  }

  const bg = isChainIdSupported(chain.id) ? "bg-theme1" : "bg-red-500";

  return (
    <div className="relative">
      <Listbox
        onChange={(chainId) => {
          if (chainId !== chain.id) {
            switchChain({ chainId });
          }
        }}
        value={chain.id}
      >
        <Listbox.Button
          className={`flex text-zinc-200 rounded-xl px-4 py-2 items-center gap-2 drop-shadow-lg hover:scale-105 disabled:cursor-not-allowed disabled:scale-100 justify-center bg-black hover:bg-gray-950 disabled:text-gray-700 ${bg}`}
        >
          {isChainIdSupported(chain.id) ? (
            <ChainIcon chainName={chain.name} className="h-4" />
          ) : (
            <div>
              <FontAwesomeIcon className="mr-1" icon={faWaveSquare} />
              Unsupported Network
            </div>
          )}
          {chain.name}
        </Listbox.Button>
        <Listbox.Options className="absolute left-0 p-2 top-14 rounded-xl bg-black">
          {chains.map((chain) => {
            return isChainIdSupported(chain.id) ? (
              <Listbox.Option
                className={({ active }) =>
                  `flex items-center justify-between w-44 px-3 py-1 rounded-md cursor-pointer ui-active:bg-gray-600 text-zinc-200 whitespace-nowrap ${
                    active ? "bg-gray-900" : ""
                  }`
                }
                key={chain.id}
                value={chain.id}
              >
                <ChainIcon chainName={chain.name} className="h-4" />
                <div>
                  {chain.name}
                  <FontAwesomeIcon
                    className="hidden ml-2 ui-selected:inline-block"
                    icon={faCheck}
                  />
                </div>
              </Listbox.Option>
            ) : null;
          })}
        </Listbox.Options>
      </Listbox>
    </div>
  );
}
