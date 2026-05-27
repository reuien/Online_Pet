import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { PetsModule } from './pets/pets.module';
import { LocationsModule } from './locations/locations.module';
import { ActivitiesModule } from './activities/activities.module';
import { PetLogsModule } from './pet-logs/pet-logs.module';
import { LocationsService } from './locations/locations.service';
import { ActivitiesService } from './activities/activities.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    PetsModule,
    LocationsModule,
    ActivitiesModule,
    PetLogsModule,
  ],
})
export class AppModule implements OnModuleInit {
  constructor(
    private readonly locationsService: LocationsService,
    private readonly activitiesService: ActivitiesService,
  ) {}

  async onModuleInit() {
    await this.locationsService.seed();
    await this.activitiesService.seed();
  }
}
