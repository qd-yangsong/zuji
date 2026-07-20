import { IsString, IsOptional, IsEnum, IsArray, IsDateString } from 'class-validator';

export enum RouteType {
  COLLECTION = 'collection',
  JOURNEY = 'journey',
}

export class CreateRouteDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  coverImage?: string;

  @IsOptional()
  @IsEnum(RouteType)
  type?: RouteType;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  placeIds?: string[];
}
