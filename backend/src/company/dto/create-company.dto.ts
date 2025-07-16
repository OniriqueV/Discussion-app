import { IsString, IsOptional, IsInt, IsDateString, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCompanyDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  expired_time?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  max_users?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUrl()
  logo?: string;
}