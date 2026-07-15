import { Controller, Get, Param, UseGuards, ParseIntPipe, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import type { Response } from 'express';
import { BackupService } from './backup.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/constants';

@ApiTags('Sauvegarde')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@ApiBearerAuth()
@Controller('backup')
export class BackupController {
  constructor(private readonly service: BackupService) {}

  @Get('export')
  @ApiOperation({ summary: 'Export complet JSON' })
  async exportAll(@Res() res: Response) {
    const data = await this.service.exportAll();
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="backup-${new Date().toISOString().split('T')[0]}.json"`);
    res.json(data);
  }

  @Get('export/etablissement/:id')
  @ApiOperation({ summary: 'Export établissement' })
  async exportEtablissement(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    const data = await this.service.exportEtablissement(id);
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="etablissement-${id}.json"`);
    res.json(data);
  }
}
