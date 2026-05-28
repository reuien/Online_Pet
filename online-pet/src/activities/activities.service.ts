import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Activity } from './activity.entity';

type ActivitySeed = Pick<Activity, 'name' | 'description' | 'hungerChange' | 'moodChange' | 'energyChange' | 'cleanlinessChange' | 'expReward' | 'coinReward' | 'icon'> &
  Partial<Pick<Activity, 'locationId' | 'healthChange'>>;

const ACTIVITY_SEEDS: ActivitySeed[] = [
  { name: '喂食', description: '吃了一大顿美味的食物', hungerChange: 30, moodChange: 5, energyChange: 5, cleanlinessChange: -5, expReward: 10, coinReward: 2, icon: 'food' },
  { name: '玩耍', description: '玩得很开心', hungerChange: -10, moodChange: 25, energyChange: -15, cleanlinessChange: -5, locationId: 2, expReward: 20, coinReward: 5, icon: 'play' },
  { name: '洗澡', description: '洗了个香喷喷的澡', hungerChange: -5, moodChange: 5, energyChange: -10, cleanlinessChange: 40, locationId: 4, expReward: 10, coinReward: 2, icon: 'bath' },
  { name: '睡觉', description: '睡了一个好觉', hungerChange: -10, moodChange: 10, energyChange: 40, cleanlinessChange: -5, locationId: 3, expReward: 15, coinReward: 3, icon: 'sleep' },
  { name: '训练', description: '进行了体能训练', hungerChange: -15, moodChange: 10, energyChange: -20, cleanlinessChange: -10, expReward: 35, coinReward: 8, icon: 'train' },
  { name: '散步', description: '在后院悠闲地散步', hungerChange: -5, moodChange: 15, energyChange: -5, cleanlinessChange: -5, locationId: 1, expReward: 15, coinReward: 4, icon: 'walk' },
  { name: '看病', description: '去看了医生，恢复健康', hungerChange: 0, moodChange: -5, energyChange: 5, cleanlinessChange: 0, healthChange: 30, expReward: 5, coinReward: 0, icon: 'heal' },
  { name: '拍照', description: '拍了一张可爱的照片', hungerChange: 0, moodChange: 20, energyChange: -5, cleanlinessChange: 0, expReward: 10, coinReward: 10, icon: 'photo' },
];

@Injectable()
export class ActivitiesService {
  constructor(
    @InjectRepository(Activity)
    private activityRepo: Repository<Activity>,
    private dataSource: DataSource,
  ) {}

  async findAll(): Promise<Activity[]> {
    return this.activityRepo.find({ relations: { location: true } });
  }

  async seed(): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      for (const data of ACTIVITY_SEEDS) {
        const exists = await queryRunner.manager.findOne(Activity, {
          where: { name: data.name },
        });
        if (!exists) {
          await queryRunner.manager.save(Activity, data);
        } else {
          // 仅当字段为 null/undefined 时补全，不覆盖已设置的 0 值
          let updated = false;
          if (exists.expReward == null) {
            exists.expReward = data.expReward;
            updated = true;
          }
          if (exists.coinReward == null) {
            exists.coinReward = data.coinReward;
            updated = true;
          }
          if (exists.icon == null) {
            exists.icon = data.icon;
            updated = true;
          }
          if (updated) {
            await queryRunner.manager.save(Activity, exists);
          }
        }
      }

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
