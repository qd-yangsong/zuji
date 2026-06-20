import { IsString, IsOptional, IsIn, MinLength, MaxLength } from 'class-validator';

export class CreateAnnouncementDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  title!: string;

  @IsString()
  @MinLength(1)
  content!: string;

  @IsOptional()
  @IsIn(['popup', 'banner', 'update_tip'])
  type?: string;

  @IsOptional()
  @IsString()
  minVersion?: string;

  @IsOptional()
  @IsString()
  linkUrl?: string;

  @IsOptional()
  @IsString()
  startAt?: string;

  @IsOptional()
  @IsString()
  endAt?: string;
}
