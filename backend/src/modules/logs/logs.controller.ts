import { Controller, Get, Param, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LogsService } from './logs.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/constants';

@ApiTags('Logs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@ApiBearerAuth()
@Controller('logs')
export class LogsController {
  constructor(private readonly service: LogsService) {}

  @Get()
  @ApiOperation({ summary: 'Lister les logs' })
  findAll(@Query() query: any) { return this.service.findAll(query); }

  @Get('actions')
  @ApiOperation({ summary: 'Synthèse des actions' })
  getActions() { return this.service.getActions(); }

  @Get(':entity/:entityId')
  @ApiOperation({ summary: 'Logs par entité' })
  findByEntity(@Param('entity') entity: string, @Param('entityId', ParseIntPipe) entityId: number) {
    return this.service.findByEntity(entity, entityId);
  }
}
