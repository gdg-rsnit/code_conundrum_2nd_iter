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
  const inputValidation = loginUserSchema.safeParse(credentials);
  if (!inputValidation.success) {
    throw inputValidation.error;
  }
  const { data } = await api.post('/users/auth', inputValidation.data);
  const responseValidation = loginResponseSchema.safeParse(data);
  if (!responseValidation.success) {
    throw responseValidation.error;
  }
  return responseValidation.data;
};

export const logoutRequest = async (): Promise<LogoutResponse> => {
  const { data } = await api.post('/users/logout');
  const validation = logoutResponseSchema.safeParse(data);
  if (!validation.success) {
    throw validation.error;
  }
  return validation.data;
};

export const getAllUsersRequest = async (): Promise<GetAllUsersResponse> => {
  const { data } = await api.get("/users");
  const validation = getAllUsersResponseSchema.safeParse(data);
  if (!validation.success) {
    throw validation.error;
  }
  return validation.data;
};

export const deleteUserRequest = async (id: string): Promise<DeleteUserResponse> => {
  const { data } = await api.delete(`/users/${id}`);
  const validation = deleteUserResponseSchema.safeParse(data);
  if (!validation.success) {
    throw validation.error;
  }
  return validation.data;
};