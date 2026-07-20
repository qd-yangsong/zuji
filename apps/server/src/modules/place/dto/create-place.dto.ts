import { IsString, IsNumber, IsOptional, IsArray, IsBoolean, IsInt, Min, Max, MinLength, MaxLength } from 'class-validator';

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

  // 「收藏即记录」字段（可选）
  @IsOptional()
  @IsString()
  firstImpression?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  firstImages?: string[];

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;

  @IsOptional()
  @IsBoolean()
  wantToRevisit?: boolean;
}
