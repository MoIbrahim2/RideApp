import {
  HttpException,
  HttpStatus,
  Injectable,
  UseGuards,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthGuard } from 'src/auth/guards/auth/auth.guard';
import { AppRatingDto } from 'src/DTOs/appRatingDto.dto';
import { AppRating } from 'src/entites/AppRating';
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
    @InjectRepository(AppRating) private AppRating: Repository<AppRating>,
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

  async rateTheApp(userOrDriver, appRatingData: AppRatingDto) {
    let appRating;
    if (userOrDriver.isDriver) {
      appRating = this.AppRating.create({
        ...appRatingData,
        driver: userOrDriver.id,
      });
      await this.AppRating.save(appRating);
      userOrDriver.appRating = appRating.id;
      await this.Driver.save(userOrDriver);
    } else {
      appRating = this.AppRating.create({
        ...appRatingData,
        user: userOrDriver.id,
      });
      await this.AppRating.save(appRating);
      userOrDriver.appRating = appRating.id;
      await this.User.save(userOrDriver);
    }
    console.log(userOrDriver);
    return {
      status: 'success',
      message: 'Thanks for knowing us your opinion',
      data: appRating,
    };
  }
}
