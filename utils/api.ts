import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});


// Add token to requests if it exists
api.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export interface LoginData {
    email: string;
    password: string;
}

export interface RegisterData {
    username: string;
    email: string;
    password: string;
    dob: string;
}

export interface UpdateProfileData {
    username: string;
    email: string;
    dob: string;
}

export interface AuthResponse {
    _id: string;
    username: string;
    email: string;
    dob: string;
    token?: string;
    createdAt: string;
}

export const authApi = {
    login: async (data: LoginData): Promise<AuthResponse> => {
        const response = await api.post('/auth/login', data);
        await AsyncStorage.setItem('token', response.data.token);
        return response.data;
    },

    register: async (data: RegisterData): Promise<AuthResponse> => {
        const response = await api.post('/auth/register', data);
        return response.data;
    },

    logout: async () => {
        await AsyncStorage.removeItem('token');
    },

    getProfile: async () => {
        const response = await api.get('/auth/profile');
        return response.data;
    },

    updateProfile: async (data: UpdateProfileData): Promise<AuthResponse> => {
        const response = await api.put('/auth/profile', data);
        return response.data;
    },
}; 