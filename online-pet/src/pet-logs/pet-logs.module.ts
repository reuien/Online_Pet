import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PetLogsController } from './pet-logs.controller';
import { PetLogsService } from './pet-logs.service';
import { PetLog } from './pet-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PetLog])],
  controllers: [PetLogsController],
  providers: [PetLogsService],
  exports: [PetLogsService],
})
export class PetLogsModule {}
