import {
  Controller,
  Get,
  Patch,
  Post,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { AuthGuard } from 'src/auth/guards/auth/auth.guard';
import { RestrictTO } from 'src/auth/guards/restrict-to/restrict-to.guard';
import { DriverService } from 'src/drivers/services/driver/driver.service';
import { Driver } from 'src/entites/Driver';
import { Repository } from 'typeorm';

@Controller('driver')
export class DriverController {
  constructor(private driverService: DriverService) {}

  @UseGuards(AuthGuard, RestrictTO('driver'))
  @UseInterceptors(FilesInterceptor('photos', 10))
  @Post('/addCarPhotos')
  async saveCarPhotos(
    @Req() req: Request,
    @UploadedFiles() photos: Express.Multer.File[],
  ) {
    console.log(photos);
    return this.driverService.saveCarPhotos(req['user'], photos);
  }
  @UseGuards(AuthGuard, RestrictTO('driver'))
  @Get('/getCarPhotos')
  async getCarPhotos(@Req() req: Request) {
    console.log(this.driverService.getCarPhotos(req['user']));
    return this.driverService.getCarPhotos(req['user']);
  }
  @UseGuards(AuthGuard, RestrictTO('driver'))
  @Patch('/startAcceptingRides')
  async startAcceptingRides(@Req() req: Request) {
    return this.driverService.startAcceptingRides(req['user']);
  }
}
