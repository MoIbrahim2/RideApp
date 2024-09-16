import {
  Body,
  Controller,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CreateVoucherDto } from 'src/DTOs/createVoucherDto.dto';
import { VoucherService } from 'src/voucher/service/voucher/voucher.service';

@UsePipes(ValidationPipe)
@Controller('voucher')
export class VoucherController {
  constructor(private voucherService: VoucherService) {}

  @Post('createVoucher')
  async createVoucher(@Body() createVoucherData: CreateVoucherDto) {
    return await this.voucherService.createVoucher(createVoucherData);
  }
}
