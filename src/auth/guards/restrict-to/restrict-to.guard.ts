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

export const RestrictTO = (...allowedEntities: string[]) => {
  @Injectable()
  class RestrictToGuard implements CanActivate {
    canActivate(
      context: ExecutionContext,
    ): boolean | Promise<boolean> | Observable<boolean> {
      const req = context.switchToHttp().getRequest() as Request;
      const doc = req['user'];
      let entityType = doc.isDriver ? 'driver' : 'user';

      if (entityType === 'user') {
        entityType = req['user'].role === 'admin' ? 'admin' : 'user';
      }

      // Check if the entity type is allowed
      // const isAllowed = allowedEntities.some((entity) => entity === entityType);
      const isAllowed = allowedEntities.includes(entityType);

      if (!isAllowed) {
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
