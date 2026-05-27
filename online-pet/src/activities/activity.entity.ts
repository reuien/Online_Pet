import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Location } from '../locations/location.entity';

@Entity('activities')
export class Activity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'int', name: 'hunger_change', default: 0 })
  hungerChange: number;

  @Column({ type: 'int', name: 'mood_change', default: 0 })
  moodChange: number;

  @Column({ type: 'int', name: 'energy_change', default: 0 })
  energyChange: number;

  @Column({ type: 'int', name: 'cleanliness_change', default: 0 })
  cleanlinessChange: number;

  @Column({ type: 'int', name: 'location_id', nullable: true })
  locationId: number;

  @ManyToOne(() => Location, { nullable: true })
  @JoinColumn({ name: 'location_id' })
  location: Location;
}
