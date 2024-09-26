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
import { Ride } from './Ride';

@Entity({ name: 'transactions' })
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, nullable: true })
  transactionId: number;

  @Column()
  amount: number;

  @CreateDateColumn()
  date: Date;

  @Column({ type: 'enum', enum: ['deposit', 'payment'] })
  type: 'deposit' | 'payment';
  @ManyToOne(() => Driver, { eager: true })
  @JoinColumn({ name: 'driverId' })
  driver: Driver;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Ride, { nullable: true, eager: true })
  @JoinColumn({ name: 'rideId' })
  ride?: Ride;
}
