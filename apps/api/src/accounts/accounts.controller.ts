import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AccountsService } from './accounts.service';
import { CreateAccountDto, UpdateAccountDto } from './dto';

@ApiTags('accounts')
@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all active accounts' })
  findAll() {
    return this.accountsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get account by ID' })
  findOne(@Param('id') id: string) {
    return this.accountsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new account' })
  create(@Body() dto: CreateAccountDto) {
    return this.accountsService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update account' })
  update(@Param('id') id: string, @Body() dto: UpdateAccountDto) {
    return this.accountsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete account (soft delete)' })
  remove(@Param('id') id: string) {
    return this.accountsService.remove(id);
  }

  @Post('seed')
  @ApiOperation({ summary: 'Seed default accounts' })
  seed() {
    return this.accountsService.seed();
  }
}

