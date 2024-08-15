import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ScheduleModule, SchedulerRegistry } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from 'src/DTOs/createUserDto.dto';
import { User } from 'src/entites/User';
import { Repository } from 'typeorm';

import * as bcrypt from 'bcrypt';
import { Driver } from 'src/entites/Driver';
import { CreateDriverDTO } from 'src/DTOs/createDriverDto.dto';
import { sendSms } from 'utils/sendVerificationCode';
import { VerficationCode } from 'src/entites/VerificationCode';
import { Request } from 'express';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private User: Repository<User>,
    private schedulerRegistry: SchedulerRegistry,
    private jwtService: JwtService,
    @InjectRepository(Driver) private Driver: Repository<Driver>,
    @InjectRepository(VerficationCode)
    private VerficationCode: Repository<VerficationCode>,
  ) {}

  async sendVerificationCode(
    userId: number,
    Model: Repository<User | Driver>,
    req: Request,
  ) {
    try {
      const otp = `${Math.floor(1000 + Math.random() * 9000)}`;

      const hashedOTP = await bcrypt.hash(otp, 10);
      let verificationCode;
      let link;
      if (Model === this.User) {
        verificationCode = this.VerficationCode.create({
          userId: { id: userId },
          otp: hashedOTP,
          createdAt: new Date(Date.now()),
          expiredAt: new Date(Date.now() + 10 * 60 * 1000),
        });
        link = `${req.protocol}://${req.get('host')}/api/v1/auth/verifyOTP/${userId}/${true}'`;
      } else if (Model === this.Driver) {
        verificationCode = this.VerficationCode.create({
          driverId: { id: userId },
          otp: hashedOTP,
          createdAt: new Date(Date.now()),
          expiredAt: new Date(Date.now() + 10 * 60 * 1000),
        });
        link = `${req.protocol}://${req.get('host')}/api/v1/auth/verifyOTP/${userId}/${false}'`;
      }

      await this.VerficationCode.save(verificationCode),
        await sendSms(
          'whatsapp:+201021808868',
          ` Your OTP code ${otp}. only valid for 10 minutes, Go to this link ${link} to verify your account `,
        );
      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  async verifyOTP(id: number, otp: string) {
    try {
      console.log(await this.VerficationCode.find());
      const verificationCode = await this.VerficationCode.findOne({
        where: [{ userId: { id } }, { driverId: { id } }],
      });
      if (!verificationCode) {
        throw new HttpException(
          "Can't found a user related to this verification code, or it has been verified already",
          HttpStatus.UNAUTHORIZED,
        );
      }
      if (
        new Date(Date.now()) > verificationCode.expiredAt ||
        !(await bcrypt.compare(otp, verificationCode.otp))
      ) {
        throw new HttpException(
          "Either the code expired or it's wrong ",
          HttpStatus.UNAUTHORIZED,
        );
      }
      if (verificationCode.userId) {
        await this.User.update({ id }, { verified: true });
        await this.VerficationCode.delete({ userId: { id } });
      }
      if (verificationCode.driverId) {
        await this.Driver.update({ id }, { verified: true });
        await this.VerficationCode.delete({ driverId: { id } });
      }
      return { status: 'verified', message: 'email has been verified' };
    } catch (err) {
      console.log(err);
      return { message: err.message };
    }
  }

  async signupUsers(createUserData: CreateUserDto, req: Request) {
    try {
      const user = this.User.create(createUserData);
      const newUser = await this.User.save(user);

      if (!newUser)
        throw new HttpException("Can't create user", HttpStatus.BAD_REQUEST);

      const token = await this.jwtService.signAsync({ userId: newUser.id });
      const { password, ...userWithoutPassword } = newUser;

      if (!(await this.sendVerificationCode(newUser.id, this.User, req))) {
        await this.User.delete({ id: newUser.id });
        return { message: 'Error in sending verfication code' };
      }

      return {
        token,
        ...userWithoutPassword,
        message: 'Verfication code sent to whatsapp',
      };
    } catch (err) {
      return { status: err.status, message: err.message };
    }
  }

  async signupDrivers(createDriverData: CreateDriverDTO, req: Request) {
    try {
      const driver = await this.Driver.create(createDriverData);
      const newDriver = await this.Driver.save(driver);
      if (!newDriver)
        throw new HttpException("Can't create user", HttpStatus.BAD_REQUEST);

      const token = await this.jwtService.signAsync({ userId: newDriver.id });
      const { password, ...driverWithoutPassword } = newDriver;

      if (!(await this.sendVerificationCode(newDriver.id, this.Driver, req))) {
        await this.Driver.delete({ id: newDriver.id });
        return { message: 'Error in sending verfication code' };
      }

      return { token, ...driverWithoutPassword };
    } catch (err) {
      return { status: err.status, message: err.message };
    }
  }

  async loginUsers(phone: string, password: string) {
    try {
      const user = await this.User.findOne({
        where: { phone },
        select: ['email', 'password', 'id'],
      });
      if (!user || !(await bcrypt.compare(password, user.password))) {
        throw new HttpException(
          'Invalid email or Wrong password',
          HttpStatus.NOT_FOUND,
        );
      }
      const token = await this.jwtService.signAsync({ userId: user.id });

      //createUpdateLocationCron(this.schedulerRegistry, user.id, this.User);
      return { token };
    } catch (err) {
      return { status: err.status, message: err.message };
    }
  }
  async loginDrivers(phone: string, password: string) {
    try {
      const user = await this.Driver.findOne({
        where: { phone },
        select: ['email', 'password', 'id'],
      });
      if (!user || !(await bcrypt.compare(password, user.password))) {
        throw new HttpException(
          'Invalid email or Wrong password',
          HttpStatus.NOT_FOUND,
        );
      }
      const token = await this.jwtService.signAsync({ userId: user.id });

      //createUpdateLocationCron(this.schedulerRegistry, user.id, this.User);
      return { token };
    } catch (err) {
      return { status: err.status, message: err.message };
    }
  }
}
