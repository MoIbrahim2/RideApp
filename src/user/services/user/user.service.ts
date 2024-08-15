import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entites/User';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(@InjectRepository(User) private User: Repository<User>) {}
  async findAll() {
    const users = await this.User.find({
      relations: ['driverRides', 'userRides'],
    });
    return { users };
  }
}
