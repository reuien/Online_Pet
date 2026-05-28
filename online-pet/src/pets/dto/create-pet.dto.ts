import { IsString, IsIn, Length } from 'class-validator';

export const SPECIES = ['cat', 'dog', 'rabbit', 'hamster', 'bird'] as const;

export class CreatePetDto {
  @IsString()
  @Length(1, 100)
  name: string;

  @IsIn(SPECIES)
  species: string;
}
