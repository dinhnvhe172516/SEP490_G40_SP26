import { authApi } from './authApi';
import { tokenService } from './tokenService';
import { Role } from '../constants/auth';
import { AuthUser, LoginResponse } from '../types/auth';

export const authService = {
    async login(credentials: any): Promise<AuthUser> {
        const response = await authApi.login(credentials);
        const data = response.data;

        // 1. Business Validation: Role check
        if (data.role.name !== Role.PATIENT) {
            throw new Error('Tài khoản của bạn không có quyền truy cập ứng dụng Mobile (chỉ dành cho Bệnh nhân).');
        }

        // 2. Save tokens
        await tokenService.saveTokens(data.token, data.refreshToken);

        // 3. Return mapped user object
        return this.mapLoginResponseToUser(data);
    },

    async logout() {
        // Clear local storage
        await tokenService.clearTokens();
    },

    mapLoginResponseToUser(data: LoginResponse): AuthUser {
        return {
            id: data.account?.id || '',
            username: data.account?.username || '',
            email: data.account?.email || '',
            full_name: data.user?.full_name || '',
            role: data.role?.name || Role.PATIENT,
            avatar_url: data.user?.avatar_url || '',
            is_patient: data.user?.is_patient || false,
            is_doctor: data.user?.is_doctor || false,
        };
    },

    mapProfileResponseToUser(profileData: any): AuthUser {
        return {
            id: profileData.account_id?._id || '',
            username: profileData.account_id?.username || profileData.account_id?.email || '',
            email: profileData.account_id?.email || '',
            full_name: profileData.full_name || '',
            role: profileData.account_id?.role_id?.name || Role.PATIENT,
            avatar_url: profileData.avatar_url || '',
            is_patient: profileData.account_id?.role_id?.name === Role.PATIENT,
            is_doctor: profileData.account_id?.role_id?.name === Role.DOCTOR,
        };
    }
};
