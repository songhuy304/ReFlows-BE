import { registerAs } from '@nestjs/config';

export default registerAs(
  'auth',
  (): Record<string, any> => ({
    accessToken: {
      secret: process.env.AUTH_ACCESS_TOKEN_SECRET,
      tokenExp: process.env.AUTH_ACCESS_TOKEN_EXP,
    },
    refreshToken: {
      secret: process.env.AUTH_REFRESH_TOKEN_SECRET,
      tokenExp: process.env.AUTH_REFRESH_TOKEN_EXP,
    },

    googleOauth: {
      clientId: process.env.OAUTH_GOOGLE_CLIENT_ID,
      secret: process.env.OAUTH_GOOGLE_SECRETS,
      redirectUrl: process.env.OAUTH_GOOGLE_REDIRECT_URL,
      connectRedirectUrl: process.env.OAUTH_GOOGLE_CONNECT_REDIRECT_URL,
    },

    githubOauth: {
      clientId: process.env.OAUTH_GITHUB_CLIENT_ID,
      secret: process.env.OAUTH_GITHUB_SECRETS,
      redirectUrl: process.env.OAUTH_GITHUB_REDIRECT_URL,
    },
  }),
);
