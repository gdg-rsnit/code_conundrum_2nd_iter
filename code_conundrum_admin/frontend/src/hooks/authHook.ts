import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { deleteUserRequest, getAllUsersRequest, loginRequest, logoutRequest } from '../services/authService.js';

interface LoginCredentials {
  email: string;
  password: string;
  mode?: string;
}

export const useLogin = () => {
  return useMutation({
    mutationFn: ({ email, password }: LoginCredentials) => 
      loginRequest({ email, password }),
    onError: (error: any) => {
      console.error('Login error:', error);
    },
  });
};

export const useLogout = () => {
  return useMutation({
    mutationFn: logoutRequest,
    onError: (error: any) => {
      console.error('Logout error:', error);
    },
  });
};

export const useGetAllUsers = () => {
  return useQuery({
    queryFn: getAllUsersRequest,
    queryKey: ['getAllUsers'],
    staleTime: 5 * 60 * 1000, 
    gcTime: 10 * 60 * 1000, 
    retry: 1,
    select: (data) => data.users,
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteUserRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['getAllUsers'] });
    },
    onError: (error: any) => {
      console.error('Delete user error:', error);
    },
  });
};