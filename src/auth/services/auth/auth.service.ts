import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SchedulerRegistry } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from 'src/DTOs/createUserDto.dto';
import { User } from 'src/entites/User';
import { Repository } from 'typeorm';

import * as bcrypt from 'bcrypt';
import { Driver } from 'src/entites/Driver';
import { CreateDriverDTO } from 'src/DTOs/createDriverDto.dto';
import { sendSms } from 'utils/sendVerificationCode';
import { VerficationCode } from 'src/entites/VerificationCode';
import { Request, Response } from 'express';
import { sendEmail } from 'utils/email';
import { Refactoring } from 'utils/Refactoring';
import * as fs from 'fs';
import { getExactLanguageMessages } from 'utils/getExactLanguageMessages';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private User: Repository<User>,
    // private schedulerRegistry: SchedulerRegistry,
    // private jwtService: JwtService,
    private Refactoring: Refactoring,
    @InjectRepository(Driver) private Driver: Repository<Driver>,
    @InjectRepository(VerficationCode)
    private VerficationCode: Repository<VerficationCode>,
    private eventEmitter: EventEmitter2,
  ) {}

  //craete, validte, resend OTP
  async sendVerificationCode(
    userId: string,
    Model: Repository<User | Driver>,
    req: Request,
  ) {
    try {
      const otp = `${Math.floor(1000 + Math.random() * 9000)}`;
      const hashedOTP = await bcrypt.hash(otp, 10);
      let verificationCode;

      if (Model === this.User) {
        verificationCode = this.VerficationCode.create({
          userId: { id: userId },
          otp: hashedOTP,
          createdAt: new Date(Date.now()),
          expiredAt: new Date(Date.now() + 10 * 60 * 1000),
        });
      } else if (Model === this.Driver) {
        verificationCode = this.VerficationCode.create({
          driverId: { id: userId },
          otp: hashedOTP,
          createdAt: new Date(Date.now()),
          expiredAt: new Date(Date.now() + 10 * 60 * 1000),
        });
      }
      const link = `${req.protocol}://${req.get('host')}/api/v1/auth/verifyOTP`;
      await this.VerficationCode.save(verificationCode);
      const values = {
        otp,
        link,
      };

      const message = getExactLanguageMessages(
        'send_verification_code',
      ).replace(/{(\w+)}/g, (_, key) => values[key]);
      await sendSms('whatsapp:+201021808868', message);
      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  async verifyOTP(id: string, otp: string) {
    try {
      const verificationCode = await this.VerficationCode.findOne({
        where: [
          { userId: { id }, forVerification: true },
          { driverId: { id }, forVerification: true },
        ],
      });
      let message;
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
        message = getExactLanguageMessages('verify_otp_users');
      }
      if (verificationCode.driverId) {
        await this.Driver.update({ id }, { verified: true });
        await this.VerficationCode.delete({ driverId: { id } });
        message = getExactLanguageMessages('verify_otp_drivers');
      }
      return { status: 'verified', message };
    } catch (err) {
      console.log(err);
      return { message: err.message };
    }
  }
  async createNewOTP(
    userOrDriver: Driver | User,
    Model: Repository<User | Driver>,
    req: Request,
  ) {
    if (userOrDriver.verified === true)
      throw new HttpException(
        'Your account already verified',
        HttpStatus.BAD_REQUEST,
      );

    if (Model === this.Driver) {
      await this.VerficationCode.delete({ driverId: { id: userOrDriver.id } });
      if (
        !(await this.sendVerificationCode(userOrDriver.id, this.Driver, req))
      ) {
        await this.Driver.delete({ id: userOrDriver.id });
        return { message: 'Error in sending verfication code' };
      }
    } else if (Model === this.User) {
      await this.VerficationCode.delete({ userId: { id: userOrDriver.id } });
      if (!(await this.sendVerificationCode(userOrDriver.id, this.User, req))) {
        await this.User.delete({ id: userOrDriver.id });
        return { message: 'Error in sending verfication code' };
      }
    }
    return {
      status: 'sucess',
      message: getExactLanguageMessages('create_new_otp'),
    };
  }
  // Signup users, drivers
  async signupUsers(
    createUserData: CreateUserDto,
    req: Request,
    res: Response,
  ) {
    try {
      const user = this.User.create(createUserData);
      const newUser = await this.User.save(user);

      if (!newUser)
        throw new HttpException("Can't create user", HttpStatus.BAD_REQUEST);

      const token = await this.Refactoring.createSendToken(
        newUser.id,
        true,
        res,
      );
      const { password, ...userWithoutPassword } = newUser;

      if (!(await this.sendVerificationCode(newUser.id, this.User, req))) {
        await this.User.delete({ id: newUser.id });
        return { message: 'Error in sending verfication code' };
      }

      return res.status(201).json({
        token,
        ...userWithoutPassword,
        message: getExactLanguageMessages('signup_users'),
      });
    } catch (err) {
      err.status = err.status ? err.status : 500;
      return res.status(err.status).json({
        status: 'fail',
        message: err.message,
      });
    }
  }

  async signupDrivers(
    createDriverData: CreateDriverDTO,
    req: Request,
    res: Response,
  ) {
    try {
      const driver = await this.Driver.create(createDriverData);
      const newDriver = await this.Driver.save(driver);
      if (!newDriver)
        throw new HttpException("Can't create user", HttpStatus.BAD_REQUEST);

      const token = await this.Refactoring.createSendToken(
        newDriver.id,
        false,
        res,
      );
      const { password, ...driverWithoutPassword } = newDriver;

      if (!(await this.sendVerificationCode(newDriver.id, this.Driver, req))) {
        await this.Driver.delete({ id: newDriver.id });
        return { message: 'Error in sending verfication code' };
      }

      this.eventEmitter.emit('captainSignUp', newDriver.id);

      // return { token, ...driverWithoutPassword };
      return res.status(201).json({
        status: 'sucess',
        message: getExactLanguageMessages('signup_drivers'),
        data: { token, ...driverWithoutPassword },
      });
    } catch (err) {
      err.status = err.status ? err.status : 500;
      return res.status(err.status).json({
        status: 'fail',
        message: err.message,
      });
    }
  }

  async loginUsers(phone: string, password: string, res: Response) {
    try {
      const user = await this.User.findOne({
        where: { phone },
        select: ['email', 'password', 'id', 'verified'],
      });

      if (!user || !(await bcrypt.compare(password, user.password))) {
        throw new HttpException(
          'Invalid email or Wrong password',
          HttpStatus.NOT_FOUND,
        );
      }
      if (!user.verified)
        throw new HttpException(
          'You have to verify you account before be able to login',
          HttpStatus.UNAUTHORIZED,
        );

      const token = await this.Refactoring.createSendToken(user.id, true, res);

      res.status(200).json({
        status: 'success',
        message: getExactLanguageMessages('login_users_drivers'),
        token,
      });
    } catch (err) {
      err.status = err.status ? err.status : 500;
      return res.status(err.status).json({
        status: 'fail',
        message: err.message,
      });
    }
  }
  async loginDrivers(phone: string, password: string, res: Response) {
    try {
      const driver = await this.Driver.findOne({
        where: { phone },
        select: ['email', 'password', 'id', 'verified', 'accepted'],
      });
      if (!driver || !(await bcrypt.compare(password, driver.password))) {
        throw new HttpException(
          'Invalid email or Wrong password',
          HttpStatus.NOT_FOUND,
        );
      }
      if (!driver.verified)
        throw new HttpException(
          'You have to verify you account before be able to login',
          HttpStatus.UNAUTHORIZED,
        );
      if (!driver.accepted)
        throw new HttpException(
          'You have to wait until your account accepted before you can use it',
          HttpStatus.UNAUTHORIZED,
        );
      const token = await this.Refactoring.createSendToken(
        driver.id,
        false,
        res,
      );

      //createUpdateLocationCron(this.schedulerRegistry, .id, this.driver);
      return res.status(200).json({
        status: 'success',
        message: getExactLanguageMessages('login_users_drivers'),
        token,
      });
    } catch (err) {
      err.status = err.status ? err.status : 500;
      return res.status(err.status).json({
        status: 'fail',
        message: err.message,
      });
    }
  }

  async requestChangeEmailOrPhone(
    document: User | Driver,
    Model: Repository<User | Driver>,
    req: Request,
  ) {
    try {
      if (document.emailChangedAt) {
        const emailChangedAtDate = new Date(document.emailChangedAt);
        console.log(emailChangedAtDate.getTime());
        if (
          Date.now() <
          emailChangedAtDate.getTime() + 30 * 24 * 60 * 60 * 1000
        ) {
          throw new HttpException(
            'You have changed your email or phone within the last 30 days. Please wait until the 30-day period expires.',
            HttpStatus.FORBIDDEN,
          );
        }
      }
      const otp = `${Math.floor(1000 + Math.random() * 9000)}`;

      const hashedOTP = await bcrypt.hash(otp, 10);
      let verificationCode;

      if (Model === this.User) {
        verificationCode = this.VerficationCode.create({
          userId: { id: document.id },
          otp: hashedOTP,
          createdAt: new Date(Date.now()),
          expiredAt: new Date(Date.now() + 10 * 60 * 1000),
          forVerification: false,
        });
      } else if (Model === this.Driver) {
        verificationCode = this.VerficationCode.create({
          driverId: { id: document.id },
          otp: hashedOTP,
          createdAt: new Date(Date.now()),
          expiredAt: new Date(Date.now() + 10 * 60 * 1000),
          forVerification: false,
        });
      }
      await this.VerficationCode.save(verificationCode),
        await sendEmail({
          email: document.email,
          subject: 'Request changing email or phone',
          message: `Your OTP code is:${otp}`,
        });
      return {
        status: 'success',
        message: getExactLanguageMessages('request_change_email_or_phone'),
      };
    } catch (err) {
      console.log(err);
      return { err };
    }
  }
  async changingEmailOrPhone(id: string, otp: string, data) {
    try {
      if (!data) {
        throw new HttpException(
          "You didn't provide phone or email to be updated",
          HttpStatus.BAD_REQUEST,
        );
      }
      const verificationCode = await this.VerficationCode.findOne({
        where: [
          { userId: { id }, forVerification: false },
          { driverId: { id }, forVerification: false },
        ],
      });
      if (!verificationCode) {
        throw new HttpException(
          "Can't found a user related to this verification code, or used already",
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
        await this.User.update(
          { id },
          { ...data, emailChangedAt: new Date(Date.now()) },
        );
        await this.VerficationCode.delete({ userId: { id } });
      }
      if (verificationCode.driverId) {
        await this.Driver.update(
          { id },
          { ...data, emailChangedAt: new Date(Date.now()) },
        );
        await this.VerficationCode.delete({ driverId: { id } });
      }
      return {
        status: 'success',
        message: getExactLanguageMessages('changing_email_or_phone'),
      };
    } catch (err) {
      console.log(err);
      return { message: err.message };
    }
  }
  async logout(res: Response) {
    res.clearCookie('jwt');
    return res.status(200).json({
      status: 'sucess',
      message: getExactLanguageMessages('logout'),
    });
  }
}
