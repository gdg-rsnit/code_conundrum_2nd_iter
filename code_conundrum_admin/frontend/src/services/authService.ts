import {
  loginUserSchema,
  loginResponseSchema,
  logoutResponseSchema,
  getAllUsersResponseSchema,
  deleteUserResponseSchema,
  type LoginRequest,
  type LoginResponse,
  type LogoutResponse,
  type GetAllUsersResponse,
  type DeleteUserResponse,
} from '../../../schemas/userSchema.js';
import api from '../lib/axios.js';


export const loginRequest = async (credentials: LoginRequest): Promise<LoginResponse> => {
  const validatedCredentials = loginUserSchema.parse(credentials);
  const { data } = await api.post('/users/auth', validatedCredentials);
  return loginResponseSchema.parse(data);
};

export const logoutRequest = async (): Promise<LogoutResponse> => {
  const { data } = await api.post('/users/logout');
  return logoutResponseSchema.parse(data);
};

export const getAllUsersRequest = async (): Promise<GetAllUsersResponse> => {
  const { data } = await api.get("/users");
  return getAllUsersResponseSchema.parse(data);
};

export const deleteUserRequest = async (id: string): Promise<DeleteUserResponse> => {
  const { data } = await api.delete(`/users/${id}`);
  return deleteUserResponseSchema.parse(data);
};