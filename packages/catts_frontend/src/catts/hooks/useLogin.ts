import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useSiweIdentity } from "ic-use-siwe-identity";
import { Actor, HttpAgent } from "@dfinity/agent";
import { canisterId, idlFactory } from "catts_engine/declarations";
import { _SERVICE } from "catts_engine/declarations/catts_engine.did";
import { useAccount } from "wagmi";
import { useGetUserByEthAddress } from "./useGetUserByEthAddress";
import toast from "react-hot-toast";

export const useLogin = () => {
  const { login, isLoggingIn, isPreparingLogin } = useSiweIdentity();
  const { address, isConnected } = useAccount();
  const { data: user_response } = useGetUserByEthAddress(address);
  const queryClient = useQueryClient();

  const userExists = !!user_response && "Ok" in user_response;

  return useMutation({
    mutationFn: async () => {
      if (isLoggingIn || isPreparingLogin || !isConnected) return null;
      return login();
    },
    onSuccess: async (identity) => {
      if (userExists || !identity) {
        toast.success("Signed in");
        return;
      }

      const agent = new HttpAgent({ identity });
      if (process.env.DFX_NETWORK !== "ic") {
        agent.fetchRootKey().catch((err) => {
          console.warn(
            "Unable to fetch root key. Check to ensure that your local replica is running",
          );
          console.error(err);
        });
      }
      const actor = Actor.createActor<_SERVICE>(idlFactory, {
        agent,
        canisterId,
      });

      if (!actor) {
        console.error("Unable to create actor");
        return;
      }

      await actor.user_create();
      await queryClient.invalidateQueries({
        queryKey: ["user_get_by_eth_address", address],
      });
      toast.success("Logged in");
    },
  });
};
