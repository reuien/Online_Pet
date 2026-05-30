import { Controller, Get, Param, Headers, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PetLogsService } from './pet-logs.service';
import { PetLog } from './pet-log.entity';
import { Pet } from '../pets/pets.entity';

@Controller('pet-logs')
export class PetLogsController {
  constructor(
    private readonly petLogsService: PetLogsService,
    @InjectRepository(Pet)
    private petRepo: Repository<Pet>,
  ) {}

  @Get(':petId')
  async findByPet(
    @Param('petId') petId: string,
    @Headers('x-owner-id') ownerId: string,
  ) {
    if (!ownerId) {
      throw new BadRequestException('Missing X-Owner-ID header');
    }
    const pet = await this.petRepo.findOne({ where: { id: petId } });
    if (!pet) {
      throw new NotFoundException('Pet not found');
    }
    if (pet.ownerId !== ownerId) {
      throw new ForbiddenException('Access denied');
    }
    return this.petLogsService.findByPet(petId);
  }
}
