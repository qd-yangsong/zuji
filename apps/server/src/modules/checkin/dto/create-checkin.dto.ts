import { IsString, IsOptional, IsArray, MinLength } from 'class-validator';

export class CreateCheckInDto {
  @IsString()
  @MinLength(1)
  placeId!: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @IsArray()
  @IsString({ each: true })
  eventTagIds!: string[];
}
