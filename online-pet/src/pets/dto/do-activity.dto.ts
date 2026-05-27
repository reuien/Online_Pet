import { IsInt } from 'class-validator';

export class DoActivityDto {
  @IsInt()
  activityId: number;
}
