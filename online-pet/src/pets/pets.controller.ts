import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Headers,
  BadRequestException,
} from '@nestjs/common';
import { PetsService } from './pets.service';
import { CreatePetDto } from './dto/create-pet.dto';
import { DoActivityDto } from './dto/do-activity.dto';

@Controller('pets')
export class PetsController {
  constructor(private readonly petsService: PetsService) {}

  @Post()
  create(@Body() dto: CreatePetDto, @Headers('x-owner-id') ownerId: string) {
    if (!ownerId) {
      throw new BadRequestException('Missing X-Owner-ID header');
    }
    return this.petsService.create({ ...dto, ownerId });
  }

  @Get()
  findAll(@Headers('x-owner-id') ownerId: string) {
    if (!ownerId) {
      throw new BadRequestException('Missing X-Owner-ID header');
    }
    return this.petsService.findAll(ownerId);
  }

  @Get('leaderboard/all')
  getLeaderboard() {
    return this.petsService.getLeaderboard();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.petsService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.petsService.remove(id);
  }

  @Post(':id/activity')
  doActivity(@Param('id') id: string, @Body() dto: DoActivityDto) {
    return this.petsService.doActivity(id, dto);
  }

  @Get(':id/logs')
  getLogs(@Param('id') id: string) {
    return this.petsService.getLogs(id);
  }
}
