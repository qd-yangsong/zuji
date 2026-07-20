import { IsString, IsOptional, IsInt, Min } from 'class-validator';

export class AddPlaceDto {
  @IsString()
  placeId!: string;

  @IsOptional()
  @IsString()
  dayLabel?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
