import { Injectable, Logger } from '@nestjs/common';
import { TokenRepositoryImpl } from '../repositories/token.repository';
import { ERROR_CODE } from '@/common/filters';
import { BadRequestException } from '@/common/filters/exception';
import { TokenEntity } from '@/common/database/entities';
import { CreateTokenDto, VerifyTokenDto } from '../dtos/token.request.dto';

@Injectable()
export class TokenService {
  private logger = new Logger(TokenService.name);
  private readonly defaultExpiration = new Date(
    Date.now() + 7 * 24 * 60 * 60 * 1000,
  );
  constructor(private readonly tokenRepository: TokenRepositoryImpl) {}

  async create(input: CreateTokenDto) {
    try {
      const token = this.tokenRepository.create({
        ...input,
        expiresAt: input.expiresAt ?? this.defaultExpiration,
      });
      return token;
    } catch (error) {
      this.logger.error('Error creating token', error);
      throw error;
    }
  }

  async verify(input: VerifyTokenDto): Promise<TokenEntity> {
    try {
      const tokenEntity = await this.tokenRepository.findOne({
        where: { value: input.token, type: input.type },
      });

      if (!tokenEntity) {
        throw new BadRequestException(ERROR_CODE.TOKEN_INVALID);
      }

      if (tokenEntity.expiresAt < new Date()) {
        throw new BadRequestException(ERROR_CODE.TOKEN_EXPIRED);
      }

      return tokenEntity;
    } catch (error) {
      this.logger.error('Error verifying token', error);
      throw error;
    }
  }

  async revoke(id: number): Promise<void> {
    await this.tokenRepository.remove(id);
  }
}
