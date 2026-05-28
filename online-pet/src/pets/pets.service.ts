import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
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
    private dataSource: DataSource,
  ) {}

  async create(dto: CreatePetDto & { ownerId: string }): Promise<Pet> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const pet = queryRunner.manager.create(Pet, {
        ownerId: dto.ownerId,
        name: dto.name,
        species: dto.species,
        level: 1,
        experience: 0,
        coins: 50,
      });
      const saved = await queryRunner.manager.save(pet);

      const stats = queryRunner.manager.create(PetStats, {
        petId: saved.id,
        hunger: 80,
        mood: 80,
        energy: 80,
        cleanliness: 80,
        health: 100,
        totalActivities: 0,
        lastUpdated: new Date(),
      });
      await queryRunner.manager.save(stats);

      await queryRunner.manager.save(PetLog, {
        petId: saved.id,
        message: `${dto.name} 诞生了！一只可爱的 ${dto.species}！`,
      });

      await queryRunner.commitTransaction();

      // 重新加载并计算衰减与状态
      return this.findOne(saved.id);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(ownerId: string): Promise<Pet[]> {
    const pets = await this.petRepo.find({
      where: { ownerId },
      relations: { stats: true },
      order: { createdAt: 'DESC' },
    });
    for (const pet of pets) {
      if (pet.stats) {
        this.applyDecay(pet.stats);
        pet.status = this.computeStatus(pet.stats);
      }
    }
    return pets;
  }

  async findOne(id: string): Promise<Pet> {
    const pet = await this.petRepo.findOne({
      where: { id },
      relations: { stats: true },
    });
    if (!pet) throw new NotFoundException('Pet not found');
    if (pet.stats) {
      // 纯计算，不写回数据库，避免并发竞态条件
      this.applyDecay(pet.stats);
      pet.status = this.computeStatus(pet.stats);
    }
    return pet;
  }

  async remove(id: string): Promise<{ success: boolean }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const pet = await queryRunner.manager.findOne(Pet, {
        where: { id },
        relations: { stats: true },
      });
      if (!pet) throw new NotFoundException('Pet not found');

      if (pet.stats) {
        await queryRunner.manager.delete(PetStats, id);
      }
      await queryRunner.manager.delete(PetLog, { petId: id });
      await queryRunner.manager.delete(Pet, id);

      await queryRunner.commitTransaction();
      return { success: true };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async doActivity(
    petId: string,
    dto: DoActivityDto,
  ): Promise<{ pet: Pet; log: PetLog }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 直接查询，避免触发 findOne 的副作用（applyDecay + save）
      const pet = await queryRunner.manager.findOne(Pet, {
        where: { id: petId },
        relations: { stats: true },
      });
      if (!pet) throw new NotFoundException('Pet not found');
      if (!pet.stats) throw new NotFoundException('Pet stats not found');

      const activity = await queryRunner.manager.findOne(Activity, {
        where: { id: dto.activityId },
      });
      if (!activity) throw new NotFoundException('Activity not found');

      const stats = pet.stats;
      this.applyDecay(stats);

      // 应用活动效果
      stats.hunger = this.clamp(
        stats.hunger + activity.hungerChange,
        0,
        100,
      );
      stats.mood = this.clamp(stats.mood + activity.moodChange, 0, 100);
      stats.energy = this.clamp(stats.energy + activity.energyChange, 0, 100);
      stats.cleanliness = this.clamp(
        stats.cleanliness + activity.cleanlinessChange,
        0,
        100,
      );
      if (activity.healthChange) {
        stats.health = this.clamp(
          stats.health + activity.healthChange,
          0,
          100,
        );
      }
      stats.lastUpdated = new Date();
      stats.totalActivities += 1;

      // 经验与升级（支持连续多级）
      pet.experience += activity.expReward;
      pet.coins = this.clamp(pet.coins + activity.coinReward, 0, 999999);
      while (pet.experience >= this.expForLevel(pet.level)) {
        const expNeeded = this.expForLevel(pet.level);
        pet.level += 1;
        pet.experience -= expNeeded;
        pet.coins = this.clamp(pet.coins + 20, 0, 999999);
      }
      pet.status = this.computeStatus(stats);

      // 事务内保存
      await queryRunner.manager.save(stats);
      await queryRunner.manager.save(pet);
      const log = await queryRunner.manager.save(PetLog, {
        petId,
        activityId: activity.id,
        locationId: activity.locationId ?? null,
        message: `${pet.name} ${activity.description}`,
      });

      await queryRunner.commitTransaction();

      // 直接返回内存对象，避免再次查询触发衰减
      return { pet, log };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async getLogs(petId: string): Promise<PetLog[]> {
    return this.logRepo.find({
      where: { petId },
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }

  async getLeaderboard(): Promise<Pet[]> {
    const pets = await this.petRepo.find({
      select: {
        id: true,
        name: true,
        species: true,
        level: true,
        experience: true,
        coins: true,
        status: true,
        createdAt: true,
      },
      relations: { stats: true },
      order: { level: 'DESC', experience: 'DESC' },
      take: 10,
    });
    for (const pet of pets) {
      if (pet.stats) {
        this.applyDecay(pet.stats);
        pet.status = this.computeStatus(pet.stats);
      }
    }
    return pets;
  }

  private applyDecay(stats: PetStats): void {
    const now = new Date().getTime();
    const last = new Date(stats.lastUpdated).getTime();
    const elapsedHours = Math.max(0, (now - last) / 1000 / 3600);

    stats.hunger = this.clamp(stats.hunger - elapsedHours * 2, 0, 100);
    stats.mood = this.clamp(stats.mood - elapsedHours * 1, 0, 100);
    stats.energy = this.clamp(stats.energy + elapsedHours * 1, 0, 100);
    stats.cleanliness = this.clamp(stats.cleanliness - elapsedHours * 0.5, 0, 100);

    // Health decay when other stats are low
    if (stats.hunger < 20 || stats.cleanliness < 20) {
      stats.health = this.clamp(stats.health - elapsedHours * 1, 0, 100);
    } else if (stats.hunger > 50 && stats.cleanliness > 50 && stats.mood > 50) {
      stats.health = this.clamp(stats.health + elapsedHours * 0.5, 0, 100);
    }

    stats.lastUpdated = new Date();
  }

  private computeStatus(stats: PetStats): string {
    if (stats.health < 30) return 'sick';
    if (stats.hunger < 20) return 'hungry';
    if (stats.energy < 20) return 'tired';
    if (stats.mood < 20) return 'sad';
    if (stats.cleanliness < 20) return 'dirty';
    if (stats.mood > 80 && stats.hunger > 60 && stats.energy > 60 && stats.cleanliness > 60) return 'happy';
    return 'normal';
  }

  private expForLevel(level: number): number {
    return Math.round(100 * Math.pow(1.5, level - 1));
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.round(Math.min(max, Math.max(min, value)));
  }
}
