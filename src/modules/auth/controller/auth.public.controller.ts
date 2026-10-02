import { ApiEndpoint } from '@/common/doc';
import { AuthUser, PublicRoute } from '@/common/guard/decorator';
import { JwtRefreshGuard } from '@/common/guard/providers/jwt.refresh.guard';
import { IAuthUser } from '@/common/request/interfaces';
import { ApiGenericResponseDto, ApiResponseDto } from '@/common/response';
import {
  Body,
  Controller,
  Delete,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  ForgotPasswordDto,
  LoginDto,
  RefreshDto,
  ResetPasswordDto,
  SignupDto,
} from '../dtos/request';
import { AuthRefreshResponseDto, LoginResponseDto } from '../dtos/response';
import { AuthService } from '../services/auth.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthPublicController {
  constructor(private readonly authService: AuthService) {}

  @PublicRoute()
  @Post('/login')
  @ApiEndpoint({
    summary: 'User login',
    serialization: LoginResponseDto,
    isPublic: true,
  })
  public async login(
    @Body() payload: LoginDto,
  ): Promise<ApiResponseDto<LoginResponseDto>> {
    return this.authService.login(payload);
  }

  @PublicRoute()
  @Post('/signup')
  @ApiEndpoint({
    summary: 'User signup',
    httpStatus: HttpStatus.CREATED,
    message: 'register success',
    isPublic: true,
  })
  public async signup(
    @Body() payload: SignupDto,
  ): Promise<ApiGenericResponseDto> {
    return this.authService.signup(payload);
  }

  @Delete('/logout')
  @ApiEndpoint({
    summary: 'User logout',
  })
  public async logout(
    @AuthUser() payload: IAuthUser,
  ): Promise<ApiGenericResponseDto> {
    return this.authService.logout(payload);
  }

  @ApiOperation({
    summary: 'Refresh token',
    description: 'The refresh token is read from the request body.',
  })
  @ApiCreatedResponse({ type: AuthRefreshResponseDto })
  @Post('refresh-token')
  @PublicRoute()
  @UseGuards(JwtRefreshGuard)
  public refreshTokens(
    @AuthUser() user: IAuthUser,
    @Body() payload: RefreshDto,
  ): Promise<AuthRefreshResponseDto> {
    return this.authService.refreshTokens(user, payload);
  }

  @PublicRoute()
  @Post('/forgot-password')
  @ApiEndpoint({
    summary: 'Send reset password email',
    message: '',
    isPublic: true,
  })
  public async forgotPassword(
    @Body() payload: ForgotPasswordDto,
  ): Promise<ApiGenericResponseDto> {
    return this.authService.forgotPassword(payload);
  }

  @PublicRoute()
  @Post('/reset-password')
  @ApiEndpoint({
    summary: 'Reset password with token',
    message: 'Reset password success',
    isPublic: true,
  })
  public async resetPassword(
    @Body() payload: ResetPasswordDto,
  ): Promise<ApiGenericResponseDto> {
    return this.authService.resetPassword(payload);
  }
}
