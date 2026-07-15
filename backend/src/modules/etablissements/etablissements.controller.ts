import {
  Controller, Get, Post, Body, Patch, Param, Delete, Query,
  UseGuards, ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { EtablissementsService } from './etablissements.service';
import { CreateEtablissementDto } from './dto/create-etablissement.dto';
import { UpdateEtablissementDto } from './dto/update-etablissement.dto';
import { EtablissementQueryDto } from './dto/etablissement-query.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { Role } from '../../common/constants';

@ApiTags('Établissements')
@Controller('etablissements')
export class EtablissementsController {
  constructor(private readonly etablissementsService: EtablissementsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.RESPONSABLE_INFRASTRUCTURE)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Créer un établissement' })
  @ApiResponse({ status: 201, description: 'Établissement créé' })
  create(@Body() dto: CreateEtablissementDto) {
    return this.etablissementsService.create(dto);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Lister les établissements', description: 'Liste paginée avec recherche et filtres' })
  @ApiResponse({ status: 200, description: 'Liste des établissements' })
  findAll(@Query() query: EtablissementQueryDto) {
    return this.etablissementsService.findAll(query);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Détail d\'un établissement avec toutes ses relations' })
  @ApiResponse({ status: 200, description: 'Établissement trouvé' })
  @ApiResponse({ status: 404, description: 'Non trouvé' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.etablissementsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.RESPONSABLE_INFRASTRUCTURE)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Modifier un établissement' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateEtablissementDto) {
    return this.etablissementsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Supprimer un établissement' })
  @ApiResponse({ status: 200, description: 'Supprimé' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.etablissementsService.remove(id);
  }
}
