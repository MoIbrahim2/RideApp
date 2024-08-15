import { Body, Controller, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { AuthGuard } from 'src/auth/guards/auth/auth.guard';
import { RestrictTO } from 'src/auth/guards/restrict-to/restrict-to.guard';
import { RidesService } from 'src/rides/services/rides/rides.service';

@Controller('rides')
export class RidesController {
  constructor(private rideService: RidesService) {}
  @UseGuards(AuthGuard, RestrictTO('user'))
  @Post('/bindingRide')
  async bindingRide(@Req() req: Request, @Body() data) {
    return this.rideService.bindingRide(
      req['user'].location,
      req['user'].id,
      data.to,
    );
  }
  @UseGuards(AuthGuard, RestrictTO('driver'))
  @Patch('/finishRide')
  async finishRide(@Req() req: Request) {
    return this.rideService.endRide(req['user'].id);
  }
}
