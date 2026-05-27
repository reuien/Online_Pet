import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Pet } from '../pets/pets.entity';

@Entity('pet_logs')
export class PetLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid', name: 'pet_id' })
  petId: string;

  @Column({ type: 'int', name: 'activity_id', nullable: true })
  activityId: number | null;

  @Column({ type: 'int', name: 'location_id', nullable: true })
  locationId: number | null;

  @Column({ type: 'text' })
  message: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Pet, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'pet_id' })
  pet: Pet;
}
