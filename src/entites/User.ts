import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Ride } from './Ride';
import { Acountries } from 'utils/countries_cities';
import { AppRating } from './AppRating';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  phone: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  password: string;

  @Column({ type: 'enum', enum: Acountries })
  country: string;

  @Column()
  city: string;

  @Column({ type: 'enum', enum: ['male', 'female'] })
  gender: string;

  @Column({ type: 'date' })
  birthday: Date;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitude: number;

  @Column({ type: 'date', nullable: true })
  emailChangedAt: Date;

  @Column({ type: 'float', default: 0 })
  wallet: number;

  @OneToMany(() => Ride, (ride) => ride.user)
  userRides: Ride[];
  @Column({ default: false })
  verified: boolean;

  @OneToOne(() => AppRating, (appRating) => appRating.user)
  appRating: AppRating;

  @Column({ nullable: true })
  userNotificationToken: string;

  @Column({ type: 'enum', enum: ['user', 'admin'], default: 'user' })
  role: string;
}
