import { z } from "zod";

export const cattsErrorSchema = z.object({
  code: z.number(),
  message: z.string(),
  details: z.array(z.string()),
});

export type CattsError = z.infer<typeof cattsErrorSchema>;

export const cattsErrorResponse = z.object({
  Err: cattsErrorSchema,
});

export type CattsErrorResponse = z.infer<typeof cattsErrorResponse>;
