import { useAccount } from "wagmi";
import { useActor } from "../../ic/ActorProvider";
import { useQuery } from "@tanstack/react-query";

export const useListUserRuns = () => {
  const { actor } = useActor();
  const { address } = useAccount();
  return useQuery({
    queryKey: ["run_history", address],
    queryFn: async () => {
      if (!actor) return null;
      return actor.run_list_for_user();
    },
  });
};
