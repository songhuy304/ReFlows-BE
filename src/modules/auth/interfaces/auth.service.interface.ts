import { IAuthUser } from '@/common/request/interfaces';
import { ApiGenericResponseDto, ApiResponseDto } from '@/common/response';
import {
  ForgotPasswordDto,
  LoginDto,
  RefreshDto,
  SignupDto,
  UserOauthDto,
} from '../dtos/request';
import { AuthRefreshResponseDto, LoginResponseDto } from '../dtos/response';

export interface IAuthService {
  login(payload: LoginDto): Promise<ApiResponseDto<LoginResponseDto>>;
  signup(payload: SignupDto): Promise<ApiGenericResponseDto>;
  forgotPassword(payload: ForgotPasswordDto): Promise<ApiGenericResponseDto>;
  refreshTokens(
    authUser: IAuthUser,
    payload: RefreshDto,
  ): Promise<AuthRefreshResponseDto>;

  logout(payload: IAuthUser): Promise<ApiGenericResponseDto>;
  validateOAuthLogin(payload: UserOauthDto): Promise<string>;
}
