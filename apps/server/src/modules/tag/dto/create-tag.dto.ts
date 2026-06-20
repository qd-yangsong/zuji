import { IsString, IsIn, IsOptional, MinLength, MaxLength } from 'class-validator';

export class CreateTagDto {
  @IsString()
  @MinLength(1)
  @MaxLength(20)
  name!: string;

  @IsString()
  @IsIn(['attribute', 'scene', 'event'])
  type!: string;

  @IsOptional()
  @IsString()
  groupId?: string;
}
