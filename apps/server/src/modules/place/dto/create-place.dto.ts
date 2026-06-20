import { IsString, IsNumber, IsOptional, IsArray, MinLength, MaxLength } from 'class-validator';

export class CreatePlaceDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  realName!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(50)
  customName!: string;

  @IsNumber()
  latitude!: number;

  @IsNumber()
  longitude!: number;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  coverImage?: string;

  @IsArray()
  @IsString({ each: true })
  attributeTagIds!: string[];

  @IsArray()
  @IsString({ each: true })
  sceneTagIds!: string[];
}
