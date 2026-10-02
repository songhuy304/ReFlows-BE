export const REDIS_KEYS = {
  FORGOT_PASSWORD: 'forgot-password',
  EMAIL_VERIFY: 'email-verify',
} as const;

export const redisKey = {
  forgotPassword: (token: string) => `${REDIS_KEYS.FORGOT_PASSWORD}:${token}`,
  emailVerify: (token: string) => `${REDIS_KEYS.EMAIL_VERIFY}:${token}`,
};
