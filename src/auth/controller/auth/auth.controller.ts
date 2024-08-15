import {
  Body,
  Controller,
  Param,
  Patch,
  Post,
  Req,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from 'src/auth/services/auth/auth.service';
import { CreateDriverDTO } from 'src/DTOs/createDriverDto.dto';
import { CreateUserDto } from 'src/DTOs/createUserDto.dto';
import { loginDataDto } from 'src/DTOs/loginData.dto';
import { verificationCodeDto } from 'src/DTOs/verificationCodeDto.dto';
import { CreateUserPipe } from 'src/user/pipes/create-user-pipe/create-user.pipe';

@UsePipes(ValidationPipe)
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @Post('/signupUsers')
  async signupUsers(
    @Body(CreateUserPipe) createUserDto: CreateUserDto,
    @Req() req: Request,
  ) {
    return await this.authService.signupUsers(createUserDto, req);
  }

  @Post('/signupDrivers')
  async signupDrivers(
    @Body(CreateUserPipe) createDriverData: CreateDriverDTO,
    @Req() req: Request,
  ) {
    return await this.authService.signupDrivers(createDriverData, req);
  }
  @Post('/loginUsers')
  async loginUsers(@Body() loginData: loginDataDto) {
    return this.authService.loginUsers(loginData.phone, loginData.password);
  }
  @Post('/loginDrivers')
  async loginDrivers(@Body() loginData: loginDataDto) {
    return this.authService.loginDrivers(loginData.phone, loginData.password);
  }
  @Patch('/verifyOTP/:id')
  async verfityOTP(
    @Param('id') id: number,

    @Body() dataOfOTP: verificationCodeDto,
  ) {
    return this.authService.verifyOTP(id, dataOfOTP.otp);
  }
}
