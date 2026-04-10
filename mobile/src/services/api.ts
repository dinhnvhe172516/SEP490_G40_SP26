import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { tokenService } from './tokenService';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});

// Flag to prevent multiple refresh calls
let isRefreshing = false;
// Queue to store failed requests while refreshing
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });

    failedQueue = [];
};

// 1. Request Interceptor: Attach access token
apiClient.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        const token = await tokenService.getAccessToken();
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// 2. Response Interceptor: Handle 401 and Refresh Token
apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as any;

        // If not 401, or already retried twice, reject
        if (error.response?.status !== 401 || originalRequest._retry) {
            return Promise.reject(error);
        }

        if (isRefreshing) {
            // If already refreshing, add request to queue
            return new Promise((resolve, reject) => {
                failedQueue.push({ resolve, reject });
            })
                .then((token) => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return apiClient(originalRequest);
                })
                .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
            const refreshToken = await tokenService.getRefreshToken();
            
            if (!refreshToken) {
                throw new Error('No refresh token available');
            }

            // Call refresh API directly to avoid circular interceptor issue
            const response = await axios.post(`${API_BASE_URL}/api/auth/refresh-token`, { 
                refreshToken 
            });

            const { token, refreshToken: newRefreshToken } = response.data.data;

            // Save new tokens
            await tokenService.saveTokens(token, newRefreshToken);

            // Update header for original request
            originalRequest.headers.Authorization = `Bearer ${token}`;

            // Resolve all queued requests
            processQueue(null, token);

            return apiClient(originalRequest);
        } catch (refreshError) {
            // If refresh fails, clear tokens and reject queue
            processQueue(refreshError, null);
            await tokenService.clearTokens();
            
            // Note: AuthContext should listen to this or we trigger a logout event
            return Promise.reject(refreshError);
        } finally {
            isRefreshing = false;
        }
    }
);

export default apiClient;
