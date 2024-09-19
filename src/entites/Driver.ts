import {
  Entity,
  Column,
  OneToMany,
  PrimaryGeneratedColumn,
  BeforeInsert,
  OneToOne,
  JoinColumn,
} from 'typeorm';

import { Ride } from './Ride';
import { Acountries } from 'utils/countries_cities';
import * as bcrypt from 'bcrypt';
import { AppRating } from './AppRating';

@Entity({ name: 'drivers' })
export class Driver {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ default: true })
  isDriver: boolean;
  @Column()
  name: string;

  @Column({ unique: true })
  phone: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  password: string;

  @Column({
    type: 'enum',
    enum: Acountries,
  })
  country: string;

  @Column()
  city: string;

  @Column({ type: 'enum', enum: ['male', 'female'] })
  gender: string;

  @Column({ type: 'date' })
  birthday: Date;

  @Column()
  carBrand: string;

  @Column()
  carEdition: string;

  @Column()
  carNumbers: string;

  @Column()
  carLetters: string;

  @Column()
  manufacturingYear: number;

  @Column({ length: 17 })
  numberVehicleId: string;

  @Column({ default: false })
  verified: boolean;

  @Column({ default: false })
  accepted: boolean;

  @Column({ default: false })
  startDriving: boolean;
  // Lat and Long
  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitude: number;

  @Column({ type: 'longtext', nullable: true })
  carPhotos: string;

  @Column()
  personalIdNumber: string;

  @Column({ type: 'date', nullable: true })
  emailChangedAt: Date;

  @Column({ type: 'float', nullable: true })
  wallet: number;

  @OneToMany(() => Ride, (ride) => ride.driver)
  driverRides: Ride[];

  @OneToOne(() => AppRating, (appRating) => appRating.user)
  appRating: AppRating;

  @Column({ type: 'enum', enum: ['small', 'medium', 'family'] })
  sizeOfTheCar: string;

  @Column({ default: undefined })
  userNotificationToken: string;

  @Column({ type: 'float', default: 3 })
  avgRating: number;

  @Column({ default: 0 })
  nRatings: number;

  @BeforeInsert()
  async beforeInsert() {
    if (this.password) this.password = await bcrypt.hash(this.password, 12);
    this.phone = this.phone.startsWith('+2') ? this.phone.slice(2) : this.phone;
  }
}
