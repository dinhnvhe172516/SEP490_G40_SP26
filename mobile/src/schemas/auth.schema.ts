import { z } from 'zod';

export const loginSchema = z.object({
    identifier: z.string().min(1, 'Vui lòng nhập Email hoặc tên đăng nhập'),
    password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
});

export const requestOtpSchema = z.object({
    email: z.string().email('Địa chỉ email không hợp lệ').min(1, 'Vui lòng nhập email'),
});

export const resetPasswordSchema = z.object({
    email: z.string().email('Địa chỉ email không hợp lệ'),
    otp: z.string().min(1, 'Vui lòng nhập mã OTP'),
    newPassword: z.string().min(8, 'Mật khẩu mới phải có ít nhất 8 ký tự')
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
        'Mật khẩu phải chứa ít nhất một chữ hoa, một chữ thường, một số và một ký tự đặc biệt'),
});

export const registerSchema = z.object({
    username: z.string().min(3, 'Tên đăng nhập phải có ít nhất 3 ký tự').max(20, 'Tên đăng nhập không được quá 20 ký tự'),
    full_name: z.string().min(1, 'Vui lòng nhập họ và tên'),
    email: z.string().email('Địa chỉ email không hợp lệ'),
    password: z.string().min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
        'Mật khẩu phải chứa ít nhất một chữ hoa, một chữ thường, một số và một ký tự đặc biệt'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RequestOtpInput = z.infer<typeof requestOtpSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
