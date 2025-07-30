// src/user/dto/update-user.dto.ts
import { IsEmail, IsOptional, IsString, IsDateString, IsEnum, IsInt } from 'class-validator';
import { Transform } from 'class-transformer';
export enum UserRole {
  ADMIN = 'admin',
  COMPANY_ACCOUNT = 'ca_user',
  MEMBER = 'member',
}
export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export class UpdateUserDto {
  @IsOptional()
  @IsEmail({}, { message: 'Email phải có định dạng hợp lệ' })
  email?: string;

  @IsOptional()
  @IsString({ message: 'Tên đầy đủ phải là chuỗi' })
  full_name?: string;

  @IsOptional()
  @IsString({ message: 'Avatar phải là chuỗi' })
  avatar?: string;

  @IsOptional()
  @IsEnum(UserRole, { message: 'Role phải là admin, company_account hoặc member' })
  role?: string;

  @IsOptional()
  @IsInt({ message: 'Company ID phải là số nguyên' })
  @Transform(({ value }) => value ? parseInt(value) : undefined)
  company_id?: number;

  @IsOptional()
  @IsDateString({}, { message: 'Ngày sinh phải có định dạng hợp lệ (YYYY-MM-DD)' })
  day_of_birth?: string;

  @IsOptional()
  @IsEnum(UserStatus, { message: 'Status phải là active hoặc inactive' })
  status?: UserStatus;
}