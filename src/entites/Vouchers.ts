import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Voucher {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column({ unique: true })
  voucherCode: string;
  @Column('date')
  expirationDate: Date;

  @Column('double')
  voucherDiscount: number;

  @Column({ default: true })
  isActive: boolean;

  @Column('int', { default: 0 })
  usageCount: number;
}
