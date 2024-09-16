import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { AuthGuard } from 'src/auth/guards/auth/auth.guard';
import { createNotificationDto } from 'src/DTOs/createNotificationDto.dto';
import { NotificationService } from 'src/notification/services/notification/notification.service';

@Controller('notification')
export class NotificationController {
  constructor(private notificationService: NotificationService) {}
  @UseGuards(AuthGuard)
  @Get('getAllNotifications')
  async getAllNotifications(@Req() req: Request) {
    return await this.notificationService.getAllNotifications(req['user']);
  }
  @UseGuards(AuthGuard)
  @Post('createNotification')
  async createNotifiation(
    @Req() req: Request,
    @Body() notificationData: createNotificationDto,
  ) {
    return await this.notificationService.createNotification(
      req['user'],
      notificationData,
    );
  }
}
