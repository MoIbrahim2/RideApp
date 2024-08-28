import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './User';
import { Driver } from './Driver';
import { Injectable } from '@nestjs/common';

@Entity({ name: 'transactions' })
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  transactionId: number;

  @Column()
  amount: number;

  @Column({ type: 'date' })
  date: Date;

  @ManyToOne(() => Driver, { eager: true })
  @JoinColumn({ name: 'driverId' }) // Specify the correct column name
  driver: Driver;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'userId' }) // Specify the correct column name
  user: User;
}
