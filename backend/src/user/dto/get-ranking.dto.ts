import { IsOptional, IsIn, IsInt, Min, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

// Backend DTO validation có thể được cải thiện
export class GetRankingDto {
  @IsOptional()
  @IsIn(['total', 'weekly', 'monthly', 'yearly'])
  period?: 'total' | 'weekly' | 'monthly' | 'yearly' = 'total';

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'limit must be a valid integer' })
  @Min(1, { message: 'limit must be at least 1' })
  limit?: number = 10; // Default value

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'page must be a valid integer' })
  @Min(1, { message: 'page must be at least 1' })
  page?: number = 1; // Default value

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'company_id must be a valid integer' })
  @IsPositive({ message: 'company_id must be positive' })
  company_id?: number;
}

