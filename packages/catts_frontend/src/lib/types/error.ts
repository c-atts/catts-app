import { z } from "zod";

export const errorWithMessage = z.object({
  message: z.string(),
});

export type ErrorWithMessage = z.infer<typeof errorWithMessage>;
