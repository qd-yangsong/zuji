import { IsString, IsOptional, IsIn, IsArray, MinLength, MaxLength } from 'class-validator';

export class CreateFeedbackDto {
  @IsString()
  @IsIn(['bug', 'suggestion', 'complaint', 'other'])
  type!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(1000)
  content!: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @IsOptional()
  @IsString()
  contact?: string;

  @IsOptional()
  @IsString()
  appVersion?: string;

  @IsOptional()
  @IsString()
  platform?: string;
}
