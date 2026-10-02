import { UserEntity } from '@/common/database/entities/user.entity';
import { ERROR_CODE } from '@/common/filters/error-code';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
} from '@/common/filters/exception';
import { HelperEncryptionService } from '@/common/helper/services/helper.encryption.service';
import { IAuthUser } from '@/common/request/interfaces';
import { ApiGenericResponseDto, ApiResponseDto } from '@/common/response';
import { generateCode } from '@/common/utils';
import { TokenService } from '@/modules/token/services/token.service';
import { UserRepositoryImpl } from '@/modules/users/repositories/user.repository';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ForgotPasswordDto,
  LoginDto,
  RefreshDto,
  ResetPasswordDto,
  SignupDto,
  UserOauthDto,
} from '../dtos/request';
import {
  AuthRefreshResponseDto,
  LoginResponseDto,
  OauthResponseDto,
} from '../dtos/response';
import { EAuthProvider, ETOKEN_TYPE } from '../enums';
import { IAuthService } from '../interfaces/auth.service.interface';
import { AuthMailService } from './auth.mail.service';

@Injectable()
export class AuthService implements IAuthService {
  private readonly logger = new Logger(AuthService.name);
  private frontendUrl: string;

  constructor(
    private readonly userRepository: UserRepositoryImpl,
    private readonly helperEncryptionService: HelperEncryptionService,
    private readonly authMailService: AuthMailService,
    private readonly configService: ConfigService,
    private readonly tokenService: TokenService,
  ) {
    this.frontendUrl = this.configService.getOrThrow('app.frontend');
  }

  public async login(
    data: LoginDto,
  ): Promise<ApiResponseDto<LoginResponseDto>> {
    const user = await this.validateUser(data.identifier, data.password);
    const tokens = await this.helperEncryptionService.createJwtTokens({
      role: user.role,
      userId: user.id,
    });

    await this.userRepository.upsertUserRefreshToken(
      user.id,
      tokens.refreshToken,
    );
    return ApiResponseDto.success(tokens);
  }

  public async signup(payload: SignupDto): Promise<ApiGenericResponseDto> {
    try {
      const { email, password } = payload;
      const user = await this.userRepository.findByEmail(email);
      if (user) {
        throw new BadRequestException(ERROR_CODE.ALREADY_EXISTS);
      }
      const hashPassword =
        await this.helperEncryptionService.createHash(password);

      await this.userRepository.create({
        ...payload,
        password: hashPassword,
      });

      return ApiGenericResponseDto.success('register success');
    } catch (error) {
      this.logger.error('Error during signup', error);
      throw new BadRequestException(`${error.message}`);
    }
  }

  public async logout(payload: IAuthUser): Promise<ApiGenericResponseDto> {
    await this.userRepository.upsertUserRefreshToken(payload.userId, null);
    return ApiGenericResponseDto.success();
  }

  public async forgotPassword(
    payload: ForgotPasswordDto,
  ): Promise<ApiGenericResponseDto> {
    const user = await this.userRepository.findByEmail(payload.email);

    if (!user) {
      throw new NotFoundException(ERROR_CODE.NOT_FOUND);
    }
    const token = generateCode(32);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 phút
    await this.tokenService.create({
      userId: user.id,
      value: token,
      type: ETOKEN_TYPE.FORGOT_PASSWORD,
      expiresAt,
    });
    await this.authMailService.forgotPasswordMail(user, token);
    return ApiGenericResponseDto.success();
  }

  public async resetPassword(
    payload: ResetPasswordDto,
  ): Promise<ApiGenericResponseDto> {
    const { token, password } = payload;

    const tokenEntity = await this.tokenService.verify({
      token,
      type: ETOKEN_TYPE.FORGOT_PASSWORD,
    });

    const passwordHash =
      await this.helperEncryptionService.createHash(password);

    await this.userRepository.update(tokenEntity.userId, {
      password: passwordHash,
    });

    await this.tokenService.revoke(tokenEntity.id);
    return ApiGenericResponseDto.success('Reset password success');
  }

  public async refreshTokens(
    authUser: IAuthUser,
    payload: RefreshDto,
  ): Promise<AuthRefreshResponseDto> {
    const user = await this.userRepository.findById(authUser.userId);

    if (!user || !user.refreshToken) {
      throw new ForbiddenException(ERROR_CODE.FORBIDDEN);
    }

    const isMatch = user.refreshToken === payload.refreshToken;

    if (!isMatch) {
      throw new UnauthorizedException(ERROR_CODE.INVALID_CREDENTIALS);
    }

    const tokenPayload: IAuthUser = {
      userId: authUser.userId,
      role: authUser.role,
    };

    const tokens =
      await this.helperEncryptionService.createJwtTokens(tokenPayload);

    await this.userRepository.upsertUserRefreshToken(
      user.id,
      tokens.refreshToken,
    );

    return tokens;
  }

  public async verifyOAuthToken(
    token: string,
  ): Promise<ApiResponseDto<OauthResponseDto>> {
    try {
      const payload = await this.helperEncryptionService.verifyToken<{
        userId: number;
      }>(token);

      const user = await this.userRepository.findById(payload.userId);

      if (!user) {
        throw new NotFoundException(ERROR_CODE.NOT_FOUND);
      }

      const tokens = await this.helperEncryptionService.createJwtTokens({
        userId: user.id,
        role: user.role,
      });

      await this.userRepository.upsertUserRefreshToken(
        user.id,
        tokens.refreshToken,
      );

      return ApiResponseDto.success(tokens);
    } catch (error) {
      this.logger.error(error);
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException(ERROR_CODE.TOKEN_INVALID);
    }
  }

  public async validateOAuthLogin(payload: UserOauthDto): Promise<string> {
    let user = await this.userRepository.findByEmail(payload.email);

    if (!user) {
      user = await this.createOAuthUser(payload);
    } else if (user.provider && user.provider !== payload.provider) {
      throw new BadRequestException(ERROR_CODE.EMAIL_PROVIDER_CONFLICT);
    }

    const token = await this.helperEncryptionService.createToken(
      {
        userId: user.id,
      },
      { expiresIn: '15m' },
    );

    return `${this.frontendUrl}/auth/verify?token=${token}`;
  }

  private async createOAuthUser(payload: UserOauthDto): Promise<UserEntity> {
    try {
      return await this.userRepository.create({
        email: payload.email,
        fullName: payload.fullName,
        avatar: payload.avatar || null,
        provider: payload.provider,
        isVerified: true,
      });
    } catch (error) {
      this.logger.error('Error creating OAuth user', error);

      throw new BadRequestException(
        `Failed to create OAuth user: ${error.message}`,
      );
    }
  }

  private async validateUser(
    identifier: string,
    password: string,
  ): Promise<UserEntity> {
    const user = await this.userRepository.findByEmail(
      identifier,
      EAuthProvider.LOCAL,
    );

    if (!user) {
      throw new UnauthorizedException(ERROR_CODE.INVALID_CREDENTIALS);
    }

    const isMatch = await this.helperEncryptionService.match(
      user.password,
      password,
    );

    if (!isMatch) {
      throw new UnauthorizedException(ERROR_CODE.INVALID_CREDENTIALS);
    }

    return user;
  }
}
