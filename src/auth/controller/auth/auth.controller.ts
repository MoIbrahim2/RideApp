import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Request, Response } from 'express';
import { AuthGuard } from 'src/auth/guards/auth/auth.guard';
import { DocumentObjectOnRequestGuard } from 'src/auth/guards/document-object-on-request/document-object-on-request.guard';
import { AuthService } from 'src/auth/services/auth/auth.service';
import { ApproveDriverDto } from 'src/DTOs/approveDriverDto.dto';
import { CreateDriverDTO } from 'src/DTOs/createDriverDto.dto';
import { CreateUserDto } from 'src/DTOs/createUserDto.dto';
import { loginDataDto } from 'src/DTOs/loginData.dto';
import { updateEmailOrPhoneDto } from 'src/DTOs/updateEmailOrPhoneDto.dto';
import { verificationCodeDto } from 'src/DTOs/verificationCodeDto.dto';
import { Driver } from 'src/entites/Driver';
import { User } from 'src/entites/User';
import { CreateUserPipe } from 'src/user/pipes/create-user-pipe/create-user.pipe';
import { Repository } from 'typeorm';

@UsePipes(ValidationPipe)
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    @InjectRepository(User) private User: Repository<User>,
    @InjectRepository(Driver) private Driver: Repository<Driver>,
  ) {}
  @Post('/signupUsers')
  async signupUsers(
    @Body(CreateUserPipe) createUserDto: CreateUserDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return await this.authService.signupUsers(createUserDto, req, res);
  }

  @Post('/signupDrivers')
  async signupDrivers(
    @Body(CreateUserPipe) createDriverData: CreateDriverDTO,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return await this.authService.signupDrivers(createDriverData, req, res);
  }
  @Post('/loginUsers')
  async loginUsers(@Body() loginData: loginDataDto, @Res() res: Response) {
    return this.authService.loginUsers(
      loginData.phone,
      loginData.password,
      res,
    );
  }
  @Post('/loginDrivers')
  async loginDrivers(@Body() loginData: loginDataDto, @Res() res: Response) {
    return this.authService.loginDrivers(
      loginData.phone,
      loginData.password,
      res,
    );
  }
  @UseGuards(DocumentObjectOnRequestGuard)
  @Patch('/verifyOTP')
  async verfityOTP(
    @Req() req: Request,
    @Body() dataOfOTP: verificationCodeDto,
  ) {
    return this.authService.verifyOTP(req['user'].id, dataOfOTP.otp);
  }
  @UseGuards(DocumentObjectOnRequestGuard)
  @Get('/resendOTP')
  async createNewOTP(@Req() req: Request) {
    const Model = req['user'].isDriver ? this.Driver : this.User;
    return this.authService.createNewOTP(req['user'], Model, req);
  }

  @UseGuards(AuthGuard)
  @Get('/requestUpdateEmailOrPhone')
  async requestUpdateEmailOrPhone(@Req() req: Request) {
    const Model = req['user'].isDriver ? this.Driver : this.User;
    return this.authService.requestChangeEmailOrPhone(req['user'], Model, req);
  }
  @UseGuards(AuthGuard)
  @Post('/changingEmailOrPhone')
  async changingEmailOrPhone(
    @Req() req: Request,
    @Body() data: updateEmailOrPhoneDto,
  ) {
    const { otp, ...dataWithoutOtp } = data;
    return this.authService.changingEmailOrPhone(
      req['user'].id,
      otp,
      dataWithoutOtp,
    );
  }
  @Get('/logout')
  async logout(@Res() res: Response) {
    return this.authService.logout(res);
  }
}
