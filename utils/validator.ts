import { z } from "zod";

const sendPlainTextSchema = z.object({
  message: z.string(),
  id: z.string(),
});

export const validator = {
  sendPlainText: sendPlainTextSchema,
};