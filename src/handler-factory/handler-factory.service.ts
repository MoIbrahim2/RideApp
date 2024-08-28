import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Driver } from 'src/entites/Driver';
import { Transaction } from 'src/entites/Transactions';
import { User } from 'src/entites/User';
import { Repository } from 'typeorm';

@Injectable()
export class HandlerFactoryService {
  constructor(
    @InjectRepository(Transaction) private Transaction: Repository<Transaction>,
    @InjectRepository(User) private User: Repository<User>,
    @InjectRepository(Driver) private Driver: Repository<Driver>,
  ) {}

  async addMoneyToWallet(amount: number, transactionId: number, userOrDriver) {
    try {
      let transaction;
      if (!userOrDriver.isDriver) {
        transaction = await this.Transaction.create({
          transactionId,
          date: new Date(Date.now()),
          amount,
          user: { id: userOrDriver.id },
        });
        userOrDriver.wallet += amount;
        await this.Transaction.save(transaction);
        await this.User.save(userOrDriver);
      } else {
        transaction = await this.Transaction.create({
          transactionId,
          date: new Date(Date.now()),
          amount,
          driver: { id: userOrDriver.id },
        });
        userOrDriver.wallet += amount;
        await this.Transaction.save(transaction);
        await this.Driver.save(userOrDriver);
      }

      return {
        status: 'success',
        message: 'The deposit is done successfully',
        data: transaction,
      };
    } catch (err) {
      console.log(err);
      return { status: 'fail', message: err.message };
    }
  }
}
