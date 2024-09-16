// import {
//   Column,
//   CreateDateColumn,
//   Entity,
//   JoinColumn,
//   JoinTable,
//   ManyToMany,
//   ManyToOne,
//   PrimaryGeneratedColumn,
// } from 'typeorm';
// import { User } from './User';
// import { NearbyDriver } from 'src/DTOs/nearbyDriver';
// import { Driver } from './Driver';

// @Entity()
// export class NearbyDrivers {
//   @PrimaryGeneratedColumn('uuid')
//   id: number;
//   @ManyToOne(() => User)
//   @JoinColumn({ name: 'userId' })
//   user: User;

//   @CreateDateColumn()
//   time: Date;

//   @Column('json')
//   nearbyDrivers: NearbyDriver[];

//   @Column('uuid')
//   rideRequestId: string;

//   @ManyToMany(() => Driver)
//   @JoinTable()
//   acceptedBy: Driver[];
// }
