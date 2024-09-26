import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entites/User';
import { EntityManager, Repository } from 'typeorm';

@Injectable()
export class PaymentsService {
  constructor(@InjectRepository(User) private User: Repository<User>) {}
  async processWalletPayment(
    user: User,
    amount: number,
    manager?: EntityManager,
  ) {
    if (user.wallet < amount) {
      throw new HttpException(
        'Not enough funds in wallet',
        HttpStatus.PAYMENT_REQUIRED,
      );
    }
    user.wallet -= amount;
    if (manager) {
      await manager.save(user);
    } else {
      await this.User.save(user);
    }
  }
}
