import * as z from "zod";

export const createTeamSchema = z.object({
  teamName: z
    .string()
    .min(3, "Team name must be at least 3 characters")
    .max(20, "Team name must be at most 20 characters")
    .trim(),
  teamMembers: z
    .array(z.string().min(1, "Member name cannot be empty"))
    .min(2, "Team must have 2 members"),
});

export const updateTeamSchema = z.object({
  teamName: z
    .string()
    .min(3, "Team name must be at least 3 characters")
    .max(20, "Team name must be at most 20 characters")
    .trim()
    .optional(),
  teamMembers: z
    .array(z.string().min(1, "Member name cannot be empty"))
    .min(2, "Team must have at least 2 members")
    .max(4, "Team can have at most 4 members")
    .optional(),
  banned: z.boolean().optional(),
});

export type CreateTeamInput = z.infer<typeof createTeamSchema>;
export type UpdateTeamInput = z.infer<typeof updateTeamSchema>;
