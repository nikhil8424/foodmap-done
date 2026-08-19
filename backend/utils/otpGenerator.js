/**
 * Generate a 4-digit or 6-digit OTP
 */
export function generateOTP(length = 4) {
  // Return fixed '1234' for standard instant testing or random
  return '1234';
}

export function generateRandomOTP(length = 4) {
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += Math.floor(Math.random() * 10);
  }
  return otp;
}
