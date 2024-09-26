import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateVoucherDto } from 'src/DTOs/createVoucherDto.dto';
import { User } from 'src/entites/User';
import { Voucher } from 'src/entites/Vouchers';
import { EntityManager, Repository } from 'typeorm';

@Injectable()
export class VoucherService {
  constructor(
    @InjectRepository(Voucher) private Voucher: Repository<Voucher>,
    @InjectRepository(User) private User: Repository<User>,
  ) {}
  async createVoucher(createVoucherData: CreateVoucherDto) {
    const voucher = this.Voucher.create(createVoucherData);
    return { status: 'success', data: await this.Voucher.save(voucher) };
  }
  async validateVoucher(voucherCode: string) {
    voucherCode = voucherCode.toUpperCase();
    const voucher = await this.Voucher.findOneBy({ voucherCode });
    if (!voucher || new Date(Date.now()) > voucher.expirationDate) {
      throw new HttpException(
        'Invalid or expired voucher',
        HttpStatus.NOT_FOUND,
      );
    }

    return voucher;
  }
  async applyVoucher(voucher: Voucher, price: number, manager?: EntityManager) {
    const actualPrice = price - price * voucher.voucherDiscount;
    voucher.usageCount++;

    if (manager) {
      await manager.save(voucher);
    } else {
      await this.Voucher.save(voucher);
    }
    return actualPrice;
  }
}
