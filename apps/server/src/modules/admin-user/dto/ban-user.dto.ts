import { IsString, IsOptional, MaxLength } from 'class-validator';

export class BanUserDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  reason?: string;
}
