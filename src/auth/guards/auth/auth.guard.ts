import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { Driver } from 'src/entites/Driver';
import { User } from 'src/entites/User';
import { Repository } from 'typeorm';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @InjectRepository(User) private User: Repository<User>,
    @InjectRepository(Driver) private Driver: Repository<Driver>,
    private jwtService: JwtService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<any> {
    const req = context.switchToHttp().getRequest() as Request;

    let token: string;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token)
      throw new HttpException(
        'You are not logged in, please login ',
        HttpStatus.UNAUTHORIZED,
      );

    let decoded: { userId; isUser: boolean };
    try {
      decoded = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });
    } catch {
      throw new UnauthorizedException('unauthorized JWT token');
    }
    let userOrDriver;
    //check if it user or driver
    if (decoded.isUser) {
      userOrDriver = await this.User.findOneBy({ id: decoded.userId });
    } else {
      userOrDriver = await this.Driver.findOneBy({ id: decoded.userId });
    }

    if (!userOrDriver) {
      throw new HttpException(
        'The user or driver belonging to this token no longer exists. Please login again',
        HttpStatus.UNAUTHORIZED,
      );
    }
    if (!userOrDriver.verified) {
      throw new HttpException(
        'You are not verified, please verify the account first ',
        HttpStatus.UNAUTHORIZED,
      );
    }
    if (userOrDriver.isDriver && !userOrDriver.accepted) {
      throw new HttpException(
        'You are not accepted yet, please wait until the admin accept the account first ',
        HttpStatus.UNAUTHORIZED,
      );
    }
    req['user'] = userOrDriver;
    return true;
  }
}
