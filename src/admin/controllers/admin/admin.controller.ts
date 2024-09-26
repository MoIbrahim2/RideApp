import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { AdminService } from 'src/admin/services/admin/admin.service';
import { AuthGuard } from 'src/auth/guards/auth/auth.guard';
import { RestrictTO } from 'src/auth/guards/restrict-to/restrict-to.guard';
import { ApproveDriverDto } from 'src/DTOs/approveDriverDto.dto';

@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @UseGuards(AuthGuard, RestrictTO('admin'))
  @Get('getAllUsers')
  async findAllUsers() {
    return this.adminService.getAllUsers();
  }
  @UseGuards(AuthGuard, RestrictTO('admin'))
  @Get('getAllCaptains')
  async findAllCaptains() {
    return this.adminService.getAllCaptains();
  }

  @UseGuards(AuthGuard, RestrictTO('admin'))
  @Patch('/approveDriver')
  async approveDriver(@Body() approveDriverData: ApproveDriverDto) {
    return this.adminService.approveDriver(approveDriverData.phone);
  }
  @UseGuards(AuthGuard, RestrictTO('admin'))
  @Get('getRides')
  async getRides(@Req() req: Request) {
    return await this.adminService.getRides(req.query);
  }
  @UseGuards(AuthGuard, RestrictTO('admin'))
  @Delete('clearDatabase')
  async clearDatabase() {
    return await this.adminService.clearDatabase();
  }
}
