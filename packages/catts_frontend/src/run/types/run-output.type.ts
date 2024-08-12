import { hexToBigInt } from "viem";
import { z } from "zod";

export const RunOutputDataItem = z
  .object({
    name: z.string(),
    type: z.string(),
    value: z.union([
      z.string(),
      z.number(),
      z.boolean(),
      z.object({ hex: z.string() }),
    ]),
  })
  .transform((item) => {
    if (item.type === "uint256" && typeof item.value === "string") {
      return {
        ...item,
        value: hexToBigInt(item.value as `0x${string}`).toString(),
      };
    }
    return item;
  });
type RunOutputDataItem = z.infer<typeof RunOutputDataItem>;

export const RunOutput = z.array(RunOutputDataItem);
export type RunOutput = z.infer<typeof RunOutput>;
