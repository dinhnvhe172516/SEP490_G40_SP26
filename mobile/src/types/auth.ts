import { Role } from '../constants/auth';

export interface AuthUser {
    id: string;
    username: string;
    email: string;
    full_name: string;
    role: Role;
    avatar_url?: string;
    is_patient: boolean;
    is_doctor: boolean;
}

export interface LoginResponse {
    token: string;
    refreshToken: string;
    account: {
        id: string;
        username: string;
        email: string;
    };
    user: {
        id: string;
        full_name: string;
        avatar_url?: string;
        is_patient: boolean;
        is_doctor: boolean;
    };
    role: {
        name: Role;
    };
}

export interface AuthState {
    user: AuthUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}
