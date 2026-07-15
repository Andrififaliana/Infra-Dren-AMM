import {
  Controller, Get, Post, Body, Patch, Param, Delete, Query,
  UseGuards, ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { EquipementsService } from './equipements.service';
import { CreateEquipementDto } from './dto/create-equipement.dto';
import { UpdateEquipementDto } from './dto/update-equipement.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/constants';

@ApiTags('Équipements')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.RESPONSABLE_INFRASTRUCTURE)
@ApiBearerAuth()
@Controller('equipements')
export class EquipementsController {
  constructor(private readonly service: EquipementsService) {}

  @Post()
  @ApiOperation({ summary: 'Créer un équipement' })
  create(@Body() dto: CreateEquipementDto) { return this.service.create(dto); }

  @Get()
  @ApiOperation({ summary: 'Lister les équipements' })
  @ApiQuery({ name: 'salleId', required: false })
  findAll(@Query('salleId') salleId?: string) {
    return this.service.findAll(salleId ? parseInt(salleId) : undefined);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Détail d\'un équipement' })
  findOne(@Param('id', ParseIntPipe) id: number) { return this.service.findOne(id); }

  @Patch(':id')
  @ApiOperation({ summary: 'Modifier un équipement' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateEquipementDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Supprimer un équipement' })
  remove(@Param('id', ParseIntPipe) id: number) { return this.service.remove(id); }
}
