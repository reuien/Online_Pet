import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PetLog } from './pet-log.entity';

@Injectable()
export class PetLogsService {
  constructor(
    @InjectRepository(PetLog)
    private logRepo: Repository<PetLog>,
  ) {}

  async findByPet(petId: string): Promise<PetLog[]> {
    return this.logRepo.find({
      where: { petId },
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }
}
