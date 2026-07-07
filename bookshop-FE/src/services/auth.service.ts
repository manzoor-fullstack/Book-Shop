import axiosInstance from '@/api/axiosInstance';
import { API_ENDPOINTS } from '@/api/endpoints';
import { 
  LoginCredentials, 
  RegisterData, 
  AuthResponse,
  UpdateProfileData,
  ForgotPasswordData,
  ResetPasswordData
} from '@/types';

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse>(
      API_ENDPOINTS.AUTH.LOGIN,
      credentials
    );
    if (response.data.data.token) {
      localStorage.setItem('authToken', response.data.data.token);
    }
    return response.data;
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    const formData = new FormData();
    formData.append('firstName', data.firstName);
    formData.append('lastName', data.lastName);
    formData.append('email', data.email);
    formData.append('password', data.password);
    formData.append('phone', data.phone);
    formData.append('address', data.address);
    if (data.profileImage) {
      formData.append('profileImage', data.profileImage);
    }

    const response = await axiosInstance.post<AuthResponse>(
      API_ENDPOINTS.AUTH.REGISTER,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    if (response.data.data.token) {
      localStorage.setItem('authToken', response.data.data.token);
    }
    return response.data;
  },

  getProfile: async () => {
    const response = await axiosInstance.get(API_ENDPOINTS.AUTH.GET_PROFILE);
    return response.data;
  },

  updateProfile: async (data: UpdateProfileData) => {
    const formData = new FormData();
    if (data.firstName) formData.append('firstName', data.firstName);
    if (data.lastName) formData.append('lastName', data.lastName);
    if (data.email) formData.append('email', data.email);
    if (data.phone) formData.append('phone', data.phone);
    if (data.address) formData.append('address', data.address);
    if (data.profileImage) formData.append('profileImage', data.profileImage);

    const response = await axiosInstance.put(
      API_ENDPOINTS.AUTH.UPDATE_PROFILE,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  forgotPassword: async (data: ForgotPasswordData) => {
    const response = await axiosInstance.post(
      API_ENDPOINTS.AUTH.FORGOT_PASSWORD,
      data
    );
    return response.data;
  },

  resetPassword: async (data: ResetPasswordData) => {
    const response = await axiosInstance.post(
      API_ENDPOINTS.AUTH.RESET_PASSWORD,
      data
    );
    return response.data;
  },

  deleteAccount: async () => {
    const response = await axiosInstance.delete(API_ENDPOINTS.AUTH.DELETE_ACCOUNT);
    localStorage.removeItem('authToken');
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('authToken');
  },
};
