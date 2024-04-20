import { z } from "zod";

export const RunOutputDataItem = z.object({
  name: z.string(),
  type: z.string(),
  value: z.union([z.string(), z.number(), z.object({ hex: z.string() })]),
});
type RunOutputDataItem = z.infer<typeof RunOutputDataItem>;

export const RunOutput = z.array(RunOutputDataItem);
export type RunOutput = z.infer<typeof RunOutput>;
