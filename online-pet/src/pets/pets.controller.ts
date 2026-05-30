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

function requireOwnerId(ownerId: string | undefined): string {
  if (!ownerId) {
    throw new BadRequestException('Missing X-Owner-ID header');
  }
  return ownerId;
}

@Controller('pets')
export class PetsController {
  constructor(private readonly petsService: PetsService) {}

  @Post()
  create(@Body() dto: CreatePetDto, @Headers('x-owner-id') ownerId: string) {
    return this.petsService.create({ ...dto, ownerId: requireOwnerId(ownerId) });
  }

  @Get()
  findAll(@Headers('x-owner-id') ownerId: string) {
    return this.petsService.findAll(requireOwnerId(ownerId));
  }

  @Get('leaderboard/all')
  getLeaderboard() {
    return this.petsService.getLeaderboard();
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Headers('x-owner-id') ownerId: string) {
    return this.petsService.findOne(id, requireOwnerId(ownerId));
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Headers('x-owner-id') ownerId: string) {
    return this.petsService.remove(id, requireOwnerId(ownerId));
  }

  @Post(':id/activity')
  doActivity(@Param('id') id: string, @Body() dto: DoActivityDto, @Headers('x-owner-id') ownerId: string) {
    return this.petsService.doActivity(id, requireOwnerId(ownerId), dto);
  }

  @Get(':id/logs')
  getLogs(@Param('id') id: string, @Headers('x-owner-id') ownerId: string) {
    return this.petsService.getLogs(id, requireOwnerId(ownerId));
  }
}
