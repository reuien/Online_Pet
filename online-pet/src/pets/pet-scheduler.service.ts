import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pet } from './pets.entity';
import { PetGateway } from './pet.gateway';
import { applyDecay, computeStatus } from './pet-utils';

@Injectable()
export class PetSchedulerService {
  private readonly logger = new Logger(PetSchedulerService.name);

  constructor(
    @InjectRepository(Pet)
    private petRepo: Repository<Pet>,
    private petGateway: PetGateway,
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async updateAllPets() {
    this.logger.log('Starting batch pet decay broadcast...');
    const start = Date.now();

    const pets = await this.petRepo.find({
      relations: { stats: true },
    });

    let broadcasted = 0;
    for (const pet of pets) {
      if (!pet.stats) continue;

      // 纯计算，不写入数据库（避免与 doActivity 事务竞态）
      applyDecay(pet.stats);
      pet.status = computeStatus(pet.stats);

      this.petGateway.emitPetUpdate(pet.id, {
        id: pet.id,
        name: pet.name,
        species: pet.species,
        status: pet.status,
        stats: pet.stats,
        level: pet.level,
        experience: pet.experience,
        coins: pet.coins,
      });

      broadcasted++;
    }

    this.logger.log(`Broadcasted ${broadcasted} pets in ${Date.now() - start}ms`);
  }
}
