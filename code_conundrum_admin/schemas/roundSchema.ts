import * as z from "zod";

export const createRoundSchema = z.object({
  roundNumber: z.number().int().positive(),
  duration: z.number().int().positive().min(1, "Duration must be at least 1 minute"),
  status: z.enum(["DRAFT", "LIVE", "ENDED"]).optional().default("DRAFT"),
});

export const updateRoundSchema = z.object({
  roundNumber:z.number().int().positive().optional(),
  duration: z.number().int().positive().optional(),
});



export type CreateRoundInput = z.infer<typeof createRoundSchema>;
export type UpdateRoundInput = z.infer<typeof updateRoundSchema>;
