import { ZodError } from 'zod';
import { AppError } from '../types/error';

export const errorMapper = (error: any): AppError => {
    // 1. Xử lý lỗi Zod (Validation errors)
    if (error instanceof ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.issues.forEach((issue) => {
            if (issue.path[0]) {
                fieldErrors[issue.path[0].toString()] = issue.message;
            }
        });
        return {
            message: 'Thông tin nhập vào không hợp lệ.',
            fieldErrors,
            code: 'VALIDATION_ERROR',
        };
    }

    // 2. Xử lý lỗi Axios (API errors)
    if (error?.response) {
        const status = error.response.status;
        const data = error.response.data;

        // Custom messages based on status codes
        switch (status) {
            case 400:
                return { message: data?.message || 'Yêu cầu không hợp lệ.', code: 'BAD_REQUEST' };
            case 401:
                return { message: data?.message || 'Phiên làm việc hết hạn. Vui lòng đăng nhập lại.', code: 'UNAUTHORIZED' };
            case 403:
                return { message: 'Bạn không có quyền thực hiện hành động này.', code: 'FORBIDDEN' };
            case 404:
                return { message: 'Không tìm thấy tài nguyên yêu cầu.', code: 'NOT_FOUND' };
            case 429:
                return { message: 'Bạn đã thực hiện quá nhiều yêu cầu. Thử lại sau.', code: 'TOO_MANY_REQUESTS' };
            case 500:
                return { message: 'Lỗi hệ thống. Vui lòng thử lại sau.', code: 'INTERNAL_SERVER_ERROR' };
            default:
                return { message: data?.message || 'Có lỗi xảy ra. Thử lại sau.', code: 'UNKNOWN_API_ERROR' };
        }
    }

    // 3. Xử lý lỗi kết nối (Network errors)
    if (error?.request) {
        return { message: 'Không thể kết nối tới máy chủ. Kiểm tra mạng của bạn.', code: 'NETWORK_ERROR' };
    }

    // 4. Các lỗi khác
    return {
        message: error?.message || 'Đã xảy ra lỗi không xác định.',
        code: 'CLIENT_ERROR',
        originalError: error,
    };
};
