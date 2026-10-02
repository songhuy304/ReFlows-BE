// oauth.controller.ts - thêm endpoint verify
import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import {
  GithubAuthGuard,
  GoogleAuthGuard,
} from '@/common/guard/providers/oauth.guard';
import { PublicRoute } from '@/common/guard/decorator';
import { UserOauthDto, VerifyOauthDto } from '../dtos/request';
import { Request, Response } from 'express';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class OauthController {
  constructor(private readonly authService: AuthService) {}

  @Get('/google')
  @PublicRoute()
  @UseGuards(GoogleAuthGuard)
  async googleAuth() {}

  @Get('/google/callback')
  @PublicRoute()
  @UseGuards(GoogleAuthGuard)
  async googleAuthRedirect(@Req() req: Request, @Res() res: Response) {
    const user = req['user'] as UserOauthDto;
    const redirectUrl = await this.authService.validateOAuthLogin(user);
    return res.redirect(302, redirectUrl);
  }

  @Get('/github')
  @PublicRoute()
  @UseGuards(GithubAuthGuard)
  async githubAuth() {}

  @Get('/github/callback')
  @PublicRoute()
  @UseGuards(GithubAuthGuard)
  async githubAuthRedirect(@Req() req: Request, @Res() res: Response) {
    const user = req['user'] as UserOauthDto;
    const redirectUrl = await this.authService.validateOAuthLogin(user);
    return res.redirect(302, redirectUrl);
  }

  @Post('/verify')
  @PublicRoute()
  async verifyOauth(@Body() body: VerifyOauthDto) {
    return this.authService.verifyOAuthToken(body.token);
  }

  // private async buildRedirectUrl(user: UserOauthDto): Promise<string> {
  //   const token = await this.authService.validateOAuthLogin(user);
  //   return `${process.env.FRONTEND_URL}/verify?token=${token}`;
  // }
}
