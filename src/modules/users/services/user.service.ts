import { ApiGenericResponseDto, ApiResponseDto } from '@/common/response';
import { UserRepositoryImpl } from '@/modules/users/repositories/user.repository';
import { Injectable, NotFoundException } from '@nestjs/common';
import { IUserService } from '../interfaces/user.service.interface';
import { UserMapper } from '../mappers/user.mapper';
import { IAuthUser } from '@/common/request/interfaces';
import { UserResponseDto } from '../dtos/responses/user.response.dto';
import { ERROR_CODE } from '@/common/filters';
import {
  ChangePasswordDto,
  UpdateUserDto,
} from '../dtos/requests/update-user.request.dto';
import { HelperEncryptionService } from '@/common/helper/services/helper.encryption.service';
import { BadRequestException } from '@/common/filters/exception';

@Injectable()
export class UserService implements IUserService {
  constructor(
    private readonly userRepository: UserRepositoryImpl,
    private readonly helperEncryptionService: HelperEncryptionService,
  ) {}

  async getProfile(
    payload: IAuthUser,
  ): Promise<ApiResponseDto<UserResponseDto>> {
    const user = await this.userRepository.findById(payload.userId);

    if (!user) {
      throw new NotFoundException(ERROR_CODE.NOT_FOUND);
    }
    const data = UserMapper.toResponse(user);
    return ApiResponseDto.success(data);
  }

  async updateProfile(
    payload: UpdateUserDto,
    authUser: IAuthUser,
  ): Promise<ApiResponseDto<UserResponseDto>> {
    const user = await this.userRepository.findById(authUser.userId);

    if (!user) {
      throw new NotFoundException(ERROR_CODE.NOT_FOUND);
    }

    const updatedUser = await this.userRepository.update(user.id, {
      ...payload,
    });

    const data = UserMapper.toResponse(updatedUser);
    return ApiResponseDto.success(data);
  }

  async changePassword(
    payload: ChangePasswordDto,
    authUser: IAuthUser,
  ): Promise<ApiGenericResponseDto> {
    const user = await this.userRepository.findById(authUser.userId);

    if (!user) {
      throw new NotFoundException(ERROR_CODE.NOT_FOUND);
    }

    const isMatchOldPassword = await this.helperEncryptionService.match(
      user.password,
      payload.oldPassword,
    );

    if (!isMatchOldPassword) {
      throw new BadRequestException(ERROR_CODE.OLD_PASSWORD_INCORRECT);
    }

    const isMatch = await this.helperEncryptionService.match(
      user.password,
      payload.newPassword,
    );

    if (isMatch) {
      throw new BadRequestException(ERROR_CODE.PASSWORD_SAME);
    }

    const hashedPassword = await this.helperEncryptionService.createHash(
      payload.newPassword,
    );

    await this.userRepository.update(user.id, {
      password: hashedPassword,
    });

    return ApiGenericResponseDto.success('Password changed successfully');
  }
}
