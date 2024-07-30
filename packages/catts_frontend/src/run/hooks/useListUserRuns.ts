import { useAccount } from "wagmi";
import { useQuery } from "@tanstack/react-query";
import { useActor } from "@/lib/ic/ActorProvider";

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
