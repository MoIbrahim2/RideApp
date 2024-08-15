import { Controller, Get } from '@nestjs/common';
import { UserService } from 'src/user/services/user/user.service';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}
  @Get()
  async findAll() {
    return this.userService.findAll();
  }
}
