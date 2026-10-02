import { ERole } from '@/common/guard/constants/role.constant';

export interface IAuthUser {
  userId: number;
  role: ERole;
}

export interface IRequest {
  user: IAuthUser;
  params: Record<string, string>;
}
