import { AxiosError } from "axios";

export interface AppError {
    message: string;
    code?: string;
    fieldErrors?: Record<string, string>;
    originalError?: AxiosError;
}
