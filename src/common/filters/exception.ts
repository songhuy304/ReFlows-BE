import { HttpException, HttpStatus } from '@nestjs/common';

export class NotFoundException extends HttpException {
  constructor(message?: string) {
    super(message || 'Not Found', HttpStatus.NOT_FOUND);
  }
}

export class BadRequestException extends HttpException {
  constructor(message?: string) {
    super(message || 'Bad Request', HttpStatus.BAD_REQUEST);
  }
}

export class ForbiddenException extends HttpException {
  constructor(message?: string) {
    super(message || 'Forbidden', HttpStatus.FORBIDDEN);
  }
}

export class BadGatewayException extends HttpException {
  constructor(message?: string) {
    super(message || 'Bad Gateway', HttpStatus.BAD_GATEWAY);
  }
}

export class UnauthorizedException extends HttpException {
  constructor(message?: string) {
    super(message || 'Unauthorized', HttpStatus.UNAUTHORIZED);
  }
}
