import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './User';
import { Driver } from './Driver';

@Entity({ name: 'reviews' })
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  refUser: User;

  @ManyToOne(() => Driver)
  refCaptain: Driver;

  @Column()
  rating: number;

  @Column('text', { nullable: true })
  comment: string;
}
