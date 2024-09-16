import { Module } from '@nestjs/common';
import { VoucherService } from './service/voucher/voucher.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Voucher } from 'src/entites/Vouchers';
import { User } from 'src/entites/User';
import { Ride } from 'src/entites/Ride';
import { VoucherController } from './controllers/voucher/voucher.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Voucher, User, Ride])],
  providers: [VoucherService],
  controllers: [VoucherController],
})
export class VoucherModule {}
