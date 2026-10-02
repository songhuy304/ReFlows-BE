import { ApiResponseDto } from '@/common/response';
import { IAuthUser } from '@/common/request/interfaces';
import { UserResponseDto } from '../dtos/responses/user.response.dto';
export interface IUserService {
  getProfile(payload: IAuthUser): Promise<ApiResponseDto<UserResponseDto>>;
}
