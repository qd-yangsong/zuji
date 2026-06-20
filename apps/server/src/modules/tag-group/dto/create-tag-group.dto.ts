import { IsString, IsIn, IsOptional, MinLength, MaxLength } from 'class-validator';

export class CreateTagGroupDto {
  @IsString()
  @MinLength(1)
  @MaxLength(20)
  name!: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsString()
  @IsIn(['scene'])
  tagType!: string;
}
