import { IsString, IsIn, IsOptional } from 'class-validator';

export class ReviewActionDto {
  @IsString()
  @IsIn(['passed', 'rejected'])
  action!: 'passed' | 'rejected';

  @IsOptional()
  @IsString()
  reason?: string;
}
