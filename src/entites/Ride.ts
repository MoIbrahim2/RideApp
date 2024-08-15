import {
  Entity,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  Column,
  ManyToOne,
} from 'typeorm';
import { User } from './User';
import { Driver } from './Driver';

@Entity({ name: 'rides' })
export class Ride {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  expectedPrice: number;

  @Column({ default: true })
  active: boolean;

  @Column({ type: 'simple-array' })
  from: string[];

  @Column({ type: 'simple-array' })
  to: string[];

  @Column({ nullable: true })
  actualPrice: number;

  @Column({ type: 'timestamp' })
  startTime: Date;

  @Column({ type: 'timestamp', nullable: true })
  endTime: Date;

  @ManyToOne(() => User, (user) => user.userRides)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Driver, (driver) => driver.driverRides)
  @JoinColumn({ name: 'driverId' })
  driver: User;
}
