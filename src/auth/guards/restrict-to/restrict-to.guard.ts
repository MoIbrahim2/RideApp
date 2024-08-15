import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  Type,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';

export const RestrictTO = (...entities: string[]) => {
  @Injectable()
  class RestrictToGuard implements CanActivate {
    canActivate(
      context: ExecutionContext,
    ): boolean | Promise<boolean> | Observable<boolean> {
      const req = context.switchToHttp().getRequest() as Request;
      const user = req['user'];
      console.log(user.entity);
      if (!entities.includes(user.entity)) {
        throw new HttpException(
          "You don't have the permission to perform this action",
          HttpStatus.UNAUTHORIZED,
        );
      }
      return true;
    }
  }
  return RestrictToGuard;
};
