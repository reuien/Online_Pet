import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Activity } from './activity.entity';

@Injectable()
export class ActivitiesService {
  constructor(
    @InjectRepository(Activity)
    private activityRepo: Repository<Activity>,
  ) {}

  async findAll(): Promise<Activity[]> {
    return this.activityRepo.find({ relations: { location: true } });
  }

  async seed(): Promise<void> {
    const count = await this.activityRepo.count();
    if (count > 0) return;
    await this.activityRepo.save([
      { name: '喂食', description: '吃了一大顿美味的食物', hungerChange: 30, moodChange: 5, energyChange: 5, cleanlinessChange: -5 },
      { name: '玩耍', description: '玩得很开心', hungerChange: -10, moodChange: 25, energyChange: -15, cleanlinessChange: -5, locationId: 2 },
      { name: '洗澡', description: '洗了个香喷喷的澡', hungerChange: -5, moodChange: 5, energyChange: -10, cleanlinessChange: 40, locationId: 4 },
      { name: '睡觉', description: '睡了一个好觉', hungerChange: -10, moodChange: 10, energyChange: 40, cleanlinessChange: -5, locationId: 3 },
    ]);
  }
}
