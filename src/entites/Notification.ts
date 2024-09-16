import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './User';
import { Driver } from './Driver';

@Entity({ name: 'notifications' })
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Column('text')
  message: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column('json')
  data: any;

  @ManyToOne(() => User, { eager: true, nullable: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Driver, { eager: true, nullable: true })
  @JoinColumn({ name: 'driverId' })
  driver: Driver;
}
