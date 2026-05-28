import { IsInt, Min } from 'class-validator';

export class DoActivityDto {
  @IsInt()
  @Min(1)
  activityId: number;
}
