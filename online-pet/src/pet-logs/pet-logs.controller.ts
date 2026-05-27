import { Controller, Get, Param } from '@nestjs/common';
import { PetLogsService } from './pet-logs.service';

@Controller('pet-logs')
export class PetLogsController {
  constructor(private readonly petLogsService: PetLogsService) {}

  @Get(':petId')
  findByPet(@Param('petId') petId: string) {
    return this.petLogsService.findByPet(petId);
  }
}
