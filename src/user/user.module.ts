import { Module } from '@nestjs/common';
import { UserController } from './controller/user/user.controller';
import { UserService } from './services/user/user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entites/User';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UserService, UserService],
  controllers: [UserController],
})
export class UserModule {}
