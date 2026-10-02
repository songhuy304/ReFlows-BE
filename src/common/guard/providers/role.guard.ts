import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_DECORATOR_KEY } from '../constants/guard.constant';
import { ForbiddenException } from '../../filters/exception';
import { ERROR_CODE } from '@/common/filters';
import { ERole } from '../constants/role.constant';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<ERole[]>(
      ROLES_DECORATOR_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user || !user.role) {
      throw new ForbiddenException(ERROR_CODE.FORBIDDEN);
    }

    const hasRole = requiredRoles.some(
      (role) =>
        user.role === role ||
        (Array.isArray(user.role) && user.role.includes(role)),
    );

    return hasRole;
  }
}
