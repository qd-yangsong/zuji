import { IsArray, IsString, ArrayMinSize } from 'class-validator';

export class ReorderPlacesDto {
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  placeIds!: string[];
}
