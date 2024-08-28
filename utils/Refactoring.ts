import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';

const cookieOptions = {
  expires: new Date(
    Date.now() +
      parseInt(process.env.JWT_COOKIE_EXPIRES_IN) * 24 * 60 * 60 * 1000,
  ),
  // secure: true,
  httpOnly: true,
};
@Injectable()
export class Refactoring {
  constructor(private jwtService: JwtService) {}

  async createSendToken(userId: number, res: Response) {
    const token = await this.jwtService.signAsync({ userId });

    res.cookie('jwt', token, cookieOptions);

    console.log('Response Headers:', res.getHeaders());

    return token;
  }
}
