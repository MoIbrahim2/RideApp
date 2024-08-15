import { join } from 'path';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './User';
import { Driver } from './Driver';
import { IsNotEmpty } from 'class-validator';

@Entity()
export class VerficationCode {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Driver, { eager: true })
  @JoinColumn({ name: 'driverId' }) // Specify the correct column name
  driverId: Driver;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'userId' }) // Specify the correct column name
  userId: User;

  @Column()
  otp: string;

  @Column({ type: 'timestamp', nullable: true })
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  expiredAt: Date;
}
