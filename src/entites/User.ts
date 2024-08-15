import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Ride } from './Ride';
import { Acountries } from 'utils/countries_cities';

@Entity({ name: 'users' })
export class User {
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

  @Column({ type: 'enum', enum: Acountries })
  country: string;

  @Column()
  city: string;

  @Column({ type: 'enum', enum: ['male', 'female'] })
  gender: string;

  @Column({ type: 'date' })
  birthday: Date;

  @Column({ type: 'simple-array', nullable: true })
  location: string[];
  @OneToMany(() => Ride, (ride) => ride.user)
  userRides: Ride[];
  @Column({ default: false })
  verified: boolean;
}
