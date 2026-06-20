import { IsString, IsOptional, IsInt, Min, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryPlaceDto {
  @IsOptional()
  @IsString()
  @IsIn(['recent', 'year', 'date', 'checkin'])
  sort?: string;

  @IsOptional()
  @IsString()
  tagId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageSize?: number;
}
