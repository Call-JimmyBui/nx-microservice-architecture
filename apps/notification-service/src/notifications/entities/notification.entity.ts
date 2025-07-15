import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { NotificationType } from '@microservice/common'
import { v4 as uuidv4 } from 'uuid';
import { BeforeInsert } from 'typeorm';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column({
    type: 'enum',
    enum: NotificationType,
  })
  type: NotificationType;

  @Column()
  subject: string;

  @Column({ type: 'text' })
  body: string;

  @Column({ nullable: true })
  recipient: string;

  @Column({ default: false })
  isSent: boolean;

  @Column({ nullable: true })
  sentAt: Date;

  @Column({ default: false })
  isRead: boolean;

  @Column({ nullable: true, type: 'jsonb' })
  metadata: object;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  generateId() {
    if (!this.id) {
      this.id = uuidv4();
    }
  }
}