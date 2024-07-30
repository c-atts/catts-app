import { catts_engine } from "catts_engine/declarations";
import { useQuery } from "@tanstack/react-query";

export const useGetRun = (runId: Uint8Array | number[]) => {
  return useQuery({
    queryKey: ["run", runId],
    queryFn: async () => {
      return catts_engine.run_get(runId);
    },
  });
};
