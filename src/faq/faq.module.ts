import { Module } from '@nestjs/common';
import { FaqService } from './services/faq.service';

import { FaqController } from './controllers/faq.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FAQ } from 'src/entites/FAQ';
import { User } from 'src/entites/User';
import { Driver } from 'src/entites/Driver';

@Module({
  imports: [TypeOrmModule.forFeature([FAQ, User, Driver])],
  providers: [FaqService],
  controllers: [FaqController],
})
export class FaqModule {}
