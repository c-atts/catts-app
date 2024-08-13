import { hexToBigInt } from "viem";
import { z } from "zod";

export const ProcessorOutputDataItem = z
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
type ProcessorOutputDataItem = z.infer<typeof ProcessorOutputDataItem>;

export const ProcessorOutput = z.array(ProcessorOutputDataItem);
export type ProcessorOutput = z.infer<typeof ProcessorOutput>;
