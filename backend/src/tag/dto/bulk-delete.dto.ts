import { IsArray, IsString, ArrayMinSize } from 'class-validator';

export class BulkDeleteTagDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  slugs: string[];
}