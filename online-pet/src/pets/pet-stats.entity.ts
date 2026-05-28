import {
  Entity,
  PrimaryColumn,
  Column,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Pet } from './pets.entity';

@Entity('pet_stats')
export class PetStats {
  @PrimaryColumn({ type: 'uuid', name: 'pet_id' })
  petId: string;

  @Column({ type: 'int', default: 80 })
  hunger: number;

  @Column({ type: 'int', default: 80 })
  mood: number;

  @Column({ type: 'int', default: 80 })
  energy: number;

  @Column({ type: 'int', default: 80 })
  cleanliness: number;

  @Column({ type: 'int', default: 100, name: 'health' })
  health: number;

  @Column({ type: 'int', default: 0, name: 'total_activities' })
  totalActivities: number;

  @UpdateDateColumn({ name: 'last_updated' })
  lastUpdated: Date;

  @OneToOne(() => Pet, (pet) => pet.stats)
  @JoinColumn({ name: 'pet_id' })
  pet: Pet;
}
