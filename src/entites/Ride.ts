import {
  Entity,
  PrimaryGeneratedColumn,
  JoinColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { User } from './User';
import { Driver } from './Driver';
import { LocationDto } from 'src/DTOs/locationDto.dto';
import { NearbyDriver } from 'src/DTOs/nearbyDriver';

@Entity({ name: 'rides' })
export class Ride {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  expectedPrice: number;

  @Column({ default: false })
  active: boolean;

  @Column('json')
  from: LocationDto;

  @Column('json')
  to: LocationDto;

  @Column({ nullable: true })
  actualPrice: number;

  @Column({ type: 'timestamp', nullable: true })
  startTime: Date;

  @Column({ type: 'timestamp', nullable: true })
  endTime: Date;

  @ManyToOne(() => User, (user) => user.userRides)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Driver, (driver) => driver.driverRides)
  @JoinColumn({ name: 'driverId' })
  driver: Driver;

  @Column({ type: 'boolean', default: false })
  rideAccepted: boolean;

  @Column({ type: 'timestamp', nullable: true })
  acceptanceTime: Date;

  @CreateDateColumn()
  time: Date;

  @Column('json', { nullable: true })
  nearbyDrivers: NearbyDriver[];

  @ManyToMany(() => Driver)
  @JoinTable()
  candidatesDrivers: Driver[];

  @Column('json', { nullable: true })
  priceOffers: { driverId: number; price: number }[];

  @Column({ type: 'enum', enum: ['wallet', 'cash'] })
  paymentMethod: string;

  @Column('timestamp', { nullable: true })
  scheduledTo: Date;
}
