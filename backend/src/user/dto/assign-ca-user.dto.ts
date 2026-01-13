import { IsInt, IsArray, ArrayMinSize } from 'class-validator';
import { Transform } from 'class-transformer';

export class AssignCaUserDto {
  @IsInt({ message: 'Company ID phải là số nguyên' })
  @Transform(({ value }) => parseInt(value))
  company_id: number;

  @IsArray({ message: 'User IDs phải là mảng' })
  @ArrayMinSize(1, { message: 'Phải có ít nhất 1 user ID' })
  @IsInt({ each: true, message: 'Mỗi user ID phải là số nguyên' })
  @Transform(({ value }) => value.map((id: any) => parseInt(id)))
  user_ids: number[];
}