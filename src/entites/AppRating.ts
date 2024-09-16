import { Entity, JoinColumn, OneToOne } from 'typeorm';
import { Column, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './User';
import { Driver } from './Driver';

@Entity({ name: 'appRatings' })
export class AppRating {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Column('double')
  rating: number;

  @Column({ nullable: true })
  comment: string;

  @OneToOne(() => User, (user) => user.appRating)
  @JoinColumn()
  user: User;

  @OneToOne(() => Driver, (driver) => driver.appRating)
  @JoinColumn()
  driver: Driver;
}
