import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Location } from './location.entity';

@Injectable()
export class LocationsService {
  constructor(
    @InjectRepository(Location)
    private locationRepo: Repository<Location>,
  ) {}

  async findAll(): Promise<Location[]> {
    return this.locationRepo.find();
  }

  async seed(): Promise<void> {
    const count = await this.locationRepo.count();
    if (count > 0) return;
    await this.locationRepo.save([
      { name: '后院', description: '阳光明媚的后院，适合散步', color: '#8fbc8f' },
      { name: '游乐场', description: '充满欢乐的游乐场', color: '#ffd700' },
      { name: '卧室', description: '温馨舒适的卧室', color: '#deb887' },
      { name: '浴室', description: '干净整洁的浴室', color: '#87ceeb' },
    ]);
  }
}
