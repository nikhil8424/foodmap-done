import { z } from 'zod';

export const requestOtpSchema = z.object({
  phone: z.string().min(8, 'Phone number must be at least 8 characters'),
});

export const verifyOtpSchema = z.object({
  phone: z.string().min(8, 'Phone number is required'),
  otp: z.string().min(4, 'OTP must be at least 4 digits'),
  role: z.enum(['resident', 'vendor']).optional().default('resident'),
  name: z.string().optional(),
});
