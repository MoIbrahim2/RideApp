import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity({ name: 'FAQs' })
export class FAQ {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Column({ type: 'text' })
  question: string;

  @Column({ type: 'text' })
  answer: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}
