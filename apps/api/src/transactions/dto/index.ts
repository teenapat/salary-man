import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsDateString,
  IsOptional,
  IsInt,
  Min,
  Max,
} from 'class-validator';

export class CreateTransactionDto {
  @ApiProperty({ example: '2026-01-10' })
  @IsDateString()
  txDate: string;

  @ApiProperty({ example: 2026 })
  @IsInt()
  postedYear: number;

  @ApiProperty({ example: 1, minimum: 1, maximum: 12 })
  @IsInt()
  @Min(1)
  @Max(12)
  postedMonth: number;

  @ApiProperty({ example: -120, description: 'Positive for income, negative for expense' })
  @IsNumber()
  amount: number;

  @ApiProperty({ example: 'ข้าว' })
  @IsString()
  description: string;

  @ApiProperty({ example: 'uuid-of-account' })
  @IsString()
  accountId: string;
}

export class CreateInstallmentDto {
  @ApiProperty({ example: '2026-01-10' })
  @IsDateString()
  txDate: string;

  @ApiProperty({ example: 2026, description: 'Year of first installment' })
  @IsInt()
  postedYear: number;

  @ApiProperty({ example: 1, minimum: 1, maximum: 12, description: 'Month of first installment' })
  @IsInt()
  @Min(1)
  @Max(12)
  postedMonth: number;

  @ApiProperty({ example: -3490, description: 'Amount per installment (negative for expense)' })
  @IsNumber()
  amount: number;

  @ApiProperty({ example: 'iPhone' })
  @IsString()
  description: string;

  @ApiProperty({ example: 'uuid-of-account' })
  @IsString()
  accountId: string;

  @ApiProperty({ example: 10, description: 'Total number of installments' })
  @IsInt()
  @Min(2)
  installmentTotal: number;
}

export class UpdateTransactionDto {
  @ApiPropertyOptional({ example: '2026-01-10' })
  @IsOptional()
  @IsDateString()
  txDate?: string;

  @ApiPropertyOptional({ example: 2026 })
  @IsOptional()
  @IsInt()
  postedYear?: number;

  @ApiPropertyOptional({ example: 1, minimum: 1, maximum: 12 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(12)
  postedMonth?: number;

  @ApiPropertyOptional({ example: -150 })
  @IsOptional()
  @IsNumber()
  amount?: number;

  @ApiPropertyOptional({ example: 'ข้าวมันไก่' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'uuid-of-account' })
  @IsOptional()
  @IsString()
  accountId?: string;
}

export class CarryOverDto {
  @ApiProperty({ example: 2026, description: 'Year to carry from' })
  @IsInt()
  fromYear: number;

  @ApiProperty({ example: 1, minimum: 1, maximum: 12, description: 'Month to carry from' })
  @IsInt()
  @Min(1)
  @Max(12)
  fromMonth: number;

  @ApiProperty({ example: -7322, description: 'Amount to carry (negative if deficit)' })
  @IsNumber()
  amount: number;
}

export class PartialPaymentDto {
  @ApiProperty({ example: 'uuid-of-transaction', description: 'Original transaction ID' })
  @IsString()
  transactionId: string;

  @ApiProperty({ example: 14000, description: 'Amount actually paid (positive number)' })
  @IsNumber()
  paidAmount: number;

  @ApiProperty({ example: 900, description: 'Interest amount (positive number)', required: false })
  @IsOptional()
  @IsNumber()
  interestAmount?: number;
}

