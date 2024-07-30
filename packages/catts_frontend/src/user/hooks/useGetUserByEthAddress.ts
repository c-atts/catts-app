import { catts_engine } from "catts_engine/declarations";
import { useQuery } from "@tanstack/react-query";

export const useGetUserByEthAddress = (address?: string) => {
  return useQuery({
    queryKey: ["user_get_by_eth_address", address],
    queryFn: async () => {
      if (!address) return null;
      return catts_engine.user_get_by_eth_address(address);
    },
  });
};
