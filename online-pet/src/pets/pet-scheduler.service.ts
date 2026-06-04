import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
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

    // 只查询当前有活跃 WebSocket 订阅者的宠物
    const activePetIds = this.getActivePetIds();
    if (activePetIds.length === 0) {
      this.logger.log('No active pet subscribers, skipping broadcast');
      return;
    }

    const pets = await this.petRepo.find({
      where: { id: In(activePetIds) },
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

    this.logger.log(
      `Broadcasted ${broadcasted}/${activePetIds.length} pets in ${Date.now() - start}ms`,
    );
  }

  private getActivePetIds(): string[] {
    const server = this.petGateway.server;
    if (!server?.sockets?.adapter?.rooms) return [];

    const rooms = server.sockets.adapter.rooms;
    const petIds: string[] = [];
    for (const [roomName, sockets] of rooms) {
      if (typeof roomName === 'string' && roomName.startsWith('pet:')) {
        const size = typeof sockets === 'object' && 'size' in sockets ? sockets.size : 0;
        if (size > 0) {
          petIds.push(roomName.slice(4));
        }
      }
    }
    return petIds;
  }
}
