import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  UpdateEvent,
} from 'typeorm';

import * as bcrypt from 'bcrypt';
import { User } from 'src/entites/User';

@EventSubscriber()
export class UserSubscriber implements EntitySubscriberInterface<User> {
  listenTo() {
    return User;
  }

  async beforeInsert(event: InsertEvent<User>) {
    if (event.entity.password)
      event.entity.password = await bcrypt.hash(event.entity.password, 12);
    event.entity.phone = event.entity.phone.startsWith('+2')
      ? event.entity.phone.slice(2)
      : event.entity.phone;
  }
  // async beforeUpdate(event: UpdateEvent<User>) {
  //   const existingUser = await event.manager.findOne(User, {
  //     where: { id: event.entity.id },
  //     select: ['password'],
  //   });

  //   if (event.entity.password !== existingUser.password) {
  //     event.entity.password = await bcrypt.hash(event.entity.password, 12);
  //   }
  // }
}
