import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthGuard } from 'src/auth/guards/auth/auth.guard';
import { RestrictTO } from 'src/auth/guards/restrict-to/restrict-to.guard';
import { AddMoneyToWallet } from 'src/DTOs/addMoneyToWalletDto.dto';
import { LocationDto } from 'src/DTOs/locationDto.dto';
import { HandlerFactoryService } from 'src/handler-factory/handler-factory.service';
import { UserService } from 'src/user/services/user/user.service';

@UsePipes(ValidationPipe)
@Controller('user')
export class UserController {
  constructor(
    private userService: UserService,
    private handlerFactoryService: HandlerFactoryService,
  ) {}
  @UseGuards(AuthGuard)
  @Get()
  async findAll() {
    return this.userService.findAll();
  }
  @UseGuards(AuthGuard, RestrictTO('user'))
  @Patch('/setUserLocation')
  async setUserLocation(@Body() location: LocationDto, @Req() req: Request) {
    return this.userService.setUserLocation(
      location.latitude,
      location.longitude,
      req['user'].id,
    );
  }
  @UseGuards(AuthGuard)
  @Get('/getUserProfile')
  async getUserProfile(@Req() req: Request) {
    return this.userService.getUserProfile(req['user']);
  }
  @UseGuards(AuthGuard)
  @Post('addMoneyToWallet')
  async addMoneyToWallet(
    @Req() req: Request,
    @Body() moneyToWallet: AddMoneyToWallet,
  ) {
    return this.handlerFactoryService.addMoneyToWallet(
      moneyToWallet.amount,
      moneyToWallet.transactionId,
      req['user'],
    );
  }
}
