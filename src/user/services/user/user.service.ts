import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { User } from 'src/entites/User';
import { Repository } from 'typeorm';
import { emailHtml } from 'utils/email';

@Injectable()
export class UserService {
  constructor(@InjectRepository(User) private User: Repository<User>) {}
  async findAll() {
    const users = await this.User.find({
      relations: ['userRides'],
    });
    return { users };
  }
  async setUserLocation(lat: number, long: number, userId) {
    const user = await this.User.findOneBy({ id: userId });
    if (!user)
      throw new HttpException('No user with that id', HttpStatus.NOT_FOUND);
    user.latitude = lat;
    user.longitude = long;

    await this.User.save(user);
    return {
      status: 'success',
      message: 'The location of the user has been added successfully',
    };
  }
  async getUserProfile(user: User) {
    return {
      name: user.name,
      email: user.email,
      phone: user.phone,
      gender: user.gender,
    };
  }
}
