import {
  Entity,
  Column,
  OneToMany,
  PrimaryGeneratedColumn,
  BeforeInsert,
} from 'typeorm';

import { Ride } from './Ride';
import { Acountries } from 'utils/countries_cities';
import * as bcrypt from 'bcrypt';

@Entity({ name: 'drivers' })
export class Driver {
  @PrimaryGeneratedColumn()
  id: number;

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

  @Column({ type: 'simple-array', nullable: true })
  location: string[];

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

  // @Column()
  // carPhotos: string[];
  @Column()
  personalIdNumber: string;
  @OneToMany(() => Ride, (ride) => ride.driver)
  driverRides: Ride[];
  @BeforeInsert()
  async beforeInsert() {
    if (this.password) this.password = await bcrypt.hash(this.password, 12);
    this.phone = this.phone.startsWith('+2') ? this.phone.slice(2) : this.phone;
  }
}
