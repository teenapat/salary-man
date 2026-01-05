import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, IsInt, IsBoolean } from 'class-validator';

export enum AccountType {
  CASH = 'CASH',
  CREDIT_CARD = 'CREDIT_CARD',
  BANK_ACCOUNT = 'BANK_ACCOUNT',
  CARRY_OVER = 'CARRY_OVER',
}

export class CreateAccountDto {
  @ApiProperty({ example: 'KTC' })
  @IsString()
  name: string;

  @ApiProperty({ enum: AccountType, example: AccountType.CREDIT_CARD })
  @IsEnum(AccountType)
  type: AccountType;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  sortOrder?: number;
}

export class UpdateAccountDto {
  @ApiPropertyOptional({ example: 'KTC Visa' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ enum: AccountType })
  @IsOptional()
  @IsEnum(AccountType)
  type?: AccountType;

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

