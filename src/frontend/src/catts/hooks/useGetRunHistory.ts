import { useAccount } from "wagmi";
import { useActor } from "../../ic/Actors";
import { useQuery } from "@tanstack/react-query";

export const useGetRunHistory = () => {
  const { actor } = useActor();
  const { address } = useAccount();
  return useQuery({
    queryKey: ["run_history", address],
    queryFn: async () => {
      if (!actor) return null;
      return actor.get_my_runs();
    },
  });
};
