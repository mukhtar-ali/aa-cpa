import { z } from 'zod';
import { emailValidation, otpValidation, passwordValidation } from './base.schema';

export const LoginSchema = z.object({
    email: emailValidation,
    password: z.string(),
});

export const CanResetPasswordSchema = z.object({
    email: emailValidation,
    otp: otpValidation,
});

export const ForgetPasswordSchema = z.object({
    email: emailValidation,
});

export const ResetPasswordSchema = z
    .object({
        email: emailValidation,
        otp: otpValidation,
        newPassword: passwordValidation,
        passwordConfirmation: passwordValidation,
    })
    .refine((data) => data.newPassword === data.passwordConfirmation, {
        message: 'Passwords do not match',
        path: ['passwordConfirmation'],
    });

export const ChangePasswordSchema = z
    .object({
        oldPassword: passwordValidation,
        newPassword: passwordValidation,
        passwordConfirmation: passwordValidation,
    })
    .refine((data) => data.newPassword === data.passwordConfirmation, {
        message: 'Passwords do not match',
        path: ['passwordConfirmation'],
    });

export const ChangeEmailSchema = z.object({
    newEmail: emailValidation,
    password: passwordValidation,
});

export const ChangeUsernameSchema = z.object({
    newUsername: z
        .string()
        .min(3, 'Username must be at least 3 characters')
        .max(30, 'Username must be at most 30 characters'),
    password: passwordValidation,
});

export const UpdateFullNameSchema = z.object({
    fullName: z
        .string()
        .min(2, 'Full name must be at least 2 characters')
        .max(100, 'Full name must be at most 100 characters'),
});
