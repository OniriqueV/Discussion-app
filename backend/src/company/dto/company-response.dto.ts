import { ApiProperty } from '@nestjs/swagger';

export class CompanyResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty({ required: false })
  address?: string;

  @ApiProperty({ required: false })
  status?: string;

  @ApiProperty({ required: false })
  expired_time?: Date;

  @ApiProperty({ required: false })
  max_users?: number;

  @ApiProperty({ required: false })
  logo?: string;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;

  @ApiProperty({ required: false })
  deleted_at?: Date;

  @ApiProperty({ required: false })
  users?: any[];

  @ApiProperty({ required: false })
  posts?: any[];
}