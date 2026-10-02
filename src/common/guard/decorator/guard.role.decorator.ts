import { SetMetadata } from '@nestjs/common';
import { ROLES_DECORATOR_KEY } from '../constants/guard.constant';
import { ERole } from '../constants/role.constant';

export const Roles = (...roles: ERole[]) =>
  SetMetadata(ROLES_DECORATOR_KEY, roles);
