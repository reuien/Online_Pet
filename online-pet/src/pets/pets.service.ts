import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pet } from './pets.entity';
import { PetStats } from './pet-stats.entity';
import { CreatePetDto } from './dto/create-pet.dto';
import { DoActivityDto } from './dto/do-activity.dto';
import { PetLog } from '../pet-logs/pet-log.entity';
import { Activity } from '../activities/activity.entity';

@Injectable()
export class PetsService {
  constructor(
    @InjectRepository(Pet)
    private petRepo: Repository<Pet>,
    @InjectRepository(PetStats)
    private statsRepo: Repository<PetStats>,
    @InjectRepository(PetLog)
    private logRepo: Repository<PetLog>,
    @InjectRepository(Activity)
    private activityRepo: Repository<Activity>,
  ) {}

  async create(dto: CreatePetDto): Promise<Pet> {
    const pet = this.petRepo.create({
      ownerId: dto.ownerId,
      name: dto.name,
      species: dto.species,
      level: 1,
    });
    const saved = await this.petRepo.save(pet);

    const stats = this.statsRepo.create({
      petId: saved.id,
      hunger: 80,
      mood: 80,
      energy: 80,
      cleanliness: 80,
      lastUpdated: new Date(),
    });
    await this.statsRepo.save(stats);

    await this.logRepo.save({
      petId: saved.id,
      message: `${dto.name} 诞生了！一只可爱的 ${dto.species}！`,
    });

    return this.findOne(saved.id);
  }

  async findAll(ownerId: string): Promise<Pet[]> {
    return this.petRepo.find({
      where: { ownerId },
      relations: { stats: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Pet> {
    const pet = await this.petRepo.findOne({
      where: { id },
      relations: { stats: true },
    });
    if (!pet) throw new NotFoundException('Pet not found');
    if (pet.stats) {
      this.applyDecay(pet.stats);
      await this.statsRepo.save(pet.stats);
    }
    return pet;
  }

  async remove(id: string): Promise<void> {
    const pet = await this.petRepo.findOne({ where: { id }, relations: { stats: true } });
    if (!pet) throw new NotFoundException('Pet not found');
    if (pet.stats) {
      await this.statsRepo.delete(id);
    }
    await this.logRepo.delete({ petId: id });
    await this.petRepo.delete(id);
  }

  async doActivity(
    petId: string,
    dto: DoActivityDto,
  ): Promise<{ pet: Pet; log: PetLog }> {
    const pet = await this.findOne(petId);
    const activity = await this.activityRepo.findOne({
      where: { id: dto.activityId },
    });
    if (!activity) throw new NotFoundException('Activity not found');

    const stats = pet.stats;
    stats.hunger = this.clamp(stats.hunger + activity.hungerChange, 0, 100);
    stats.mood = this.clamp(stats.mood + activity.moodChange, 0, 100);
    stats.energy = this.clamp(stats.energy + activity.energyChange, 0, 100);
    stats.cleanliness = this.clamp(
      stats.cleanliness + activity.cleanlinessChange,
      0,
      100,
    );
    stats.lastUpdated = new Date();
    await this.statsRepo.save(stats);

    const log = await this.logRepo.save({
      petId,
      activityId: activity.id,
      message: `${pet.name} ${activity.description}`,
    });

    return { pet: await this.findOne(petId), log };
  }

  async getLogs(petId: string): Promise<PetLog[]> {
    return this.logRepo.find({
      where: { petId },
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }

  private applyDecay(stats: PetStats): void {
    const now = new Date().getTime();
    const last = new Date(stats.lastUpdated).getTime();
    const elapsedHours = Math.max(0, (now - last) / 1000 / 3600);

    stats.hunger = this.clamp(stats.hunger - elapsedHours * 2, 0, 100);
    stats.mood = this.clamp(stats.mood - elapsedHours * 1, 0, 100);
    stats.energy = this.clamp(stats.energy + elapsedHours * 1, 0, 100);
    stats.cleanliness = this.clamp(stats.cleanliness - elapsedHours * 0.5, 0, 100);
    stats.lastUpdated = new Date();
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.round(Math.min(max, Math.max(min, value)));
  }
}
