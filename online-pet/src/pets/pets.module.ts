import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { PetsController } from './pets.controller';
import { PetsService } from './pets.service';
import { PetSchedulerService } from './pet-scheduler.service';
import { PetGateway } from './pet.gateway';
import { Pet } from './pets.entity';
import { PetStats } from './pet-stats.entity';
import { PetLog } from '../pet-logs/pet-log.entity';
import { Activity } from '../activities/activity.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Pet, PetStats, PetLog, Activity]),
    ScheduleModule.forRoot(),
  ],
  controllers: [PetsController],
  providers: [PetsService, PetSchedulerService, PetGateway],
  exports: [PetsService, PetGateway],
})
export class PetsModule {}
