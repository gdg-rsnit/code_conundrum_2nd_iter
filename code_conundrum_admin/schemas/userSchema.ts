import * as z from "zod";

export const loginResponseSchema = z.object({
  message: z.string(),
  user: z.object({
    id: z.string(),
    email: z.email(),
    role: z.string(),
  }),
});

export const logoutResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

export const userSchema = z.object({
  _id: z.string(),
  email: z.email(),
  role: z.string(),
  password: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const getAllUsersResponseSchema = z.object({
  success: z.boolean(),
  users: z.array(userSchema),
});

export const deleteUserResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

export const loginUserSchema = z.object({
  email: z
  .email("Invalid email address")
  .trim()
  .toLowerCase(),
  password: z.string().min(1, "Password is required"),
});

export type LoginRequest = z.infer<typeof loginUserSchema>;
export type LoginResponse = z.infer<typeof loginResponseSchema>;
export type LogoutResponse = z.infer<typeof logoutResponseSchema>;
export type User = z.infer<typeof userSchema>;
export type GetAllUsersResponse = z.infer<typeof getAllUsersResponseSchema>;
export type DeleteUserResponse = z.infer<typeof deleteUserResponseSchema>;
