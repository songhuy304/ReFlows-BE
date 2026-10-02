import { StringValue } from 'ms';
export interface IEncryptDataPayload {
  iv: string;
  data: string;
  tag: string;
  salt: string;
}

export interface IAuthTokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface ITempTokenOptions {
  expiresIn?: StringValue;
  secret?: string;
}

export interface IVerifyTokenOptions {
  secret?: string;
}
