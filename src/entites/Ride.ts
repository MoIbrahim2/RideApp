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
import { Voucher } from './Vouchers';

@Entity({ name: 'rides' })
export class Ride {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  expectedPrice: number;

  @Column({ default: true })
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
  priceOffers: { driverId: string; price: number }[];

  @Column({ type: 'enum', enum: ['wallet', 'cash'] })
  paymentMethod: string;

  @Column('timestamp', { nullable: true })
  scheduledTo: Date;

  @ManyToOne(() => Voucher)
  discountVoucher: Voucher;
}
