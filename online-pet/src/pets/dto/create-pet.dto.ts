import { IsString, IsUUID, IsIn, Length, IsOptional } from 'class-validator';

const SPECIES = ['cat', 'dog', 'rabbit', 'hamster', 'bird'] as const;

export class CreatePetDto {
  @IsOptional()
  @IsUUID()
  ownerId?: string;

  @IsString()
  @Length(1, 100)
  name: string;

  @IsIn(SPECIES)
  species: string;
}
