import { z } from 'zod';
import { isHttpUrl } from '../utils/url';

export const emailValidation = z.string().email('Invalid email address');

export const phoneValidation = z
    .string()
    .min(6, 'Phone number is required')
    .regex(/^[0-9]+$/, 'Phone number must contain only digits');

export const otpValidation = z.string().length(6, 'OTP must be 6 characters');

export const passwordValidation = z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password is too long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[@$!%*?&]/, 'Password must contain at least one special character');

export const requiredFieldString = (fieldName: string) =>
    z.string().min(1, `${fieldName} is required`);

export const requiredFieldNumber = (fieldName: string) =>
    z.number().refine((val) => !isNaN(val), { message: `${fieldName} is required` });

// http(s) only: z.string().url() also accepts javascript:, data: and vbscript: URLs, and these fields are
// rendered as links/images on the public site.
export const urlValidation = z
    .string()
    .url('Invalid URL')
    .refine(isHttpUrl, 'Only http(s) URLs are allowed');
export const imageValidation = z
    .string()
    .url('Required image')
    .refine(isHttpUrl, 'Only http(s) URLs are allowed');
