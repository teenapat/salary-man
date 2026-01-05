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
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('accounts')
@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all active accounts for current user' })
  findAll(@CurrentUser() user: any) {
    return this.accountsService.findAll(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get account by ID' })
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.accountsService.findOne(id, user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new account' })
  create(@Body() dto: CreateAccountDto, @CurrentUser() user: any) {
    return this.accountsService.create(user.id, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update account' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateAccountDto,
    @CurrentUser() user: any,
  ) {
    return this.accountsService.update(id, user.id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete account' })
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.accountsService.remove(id, user.id);
  }

  @Put('reorder/all')
  @ApiOperation({ summary: 'Reorder accounts' })
  reorder(@Body() body: { accountIds: string[] }, @CurrentUser() user: any) {
    return this.accountsService.reorder(user.id, body.accountIds);
  }
}
