import * as SecureStore from 'expo-secure-store';
import { AUTH_STORAGE_KEYS } from '../constants/auth';

export const tokenService = {
    async getAccessToken() {
        return await SecureStore.getItemAsync(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
    },

    async getRefreshToken() {
        return await SecureStore.getItemAsync(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
    },

    async saveTokens(accessToken: string, refreshToken?: string) {
        await SecureStore.setItemAsync(AUTH_STORAGE_KEYS.ACCESS_TOKEN, accessToken);
        if (refreshToken) {
            await SecureStore.setItemAsync(AUTH_STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
        }
    },

    async clearTokens() {
        await SecureStore.deleteItemAsync(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
        await SecureStore.deleteItemAsync(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
    },
};
