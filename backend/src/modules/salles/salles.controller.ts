import {
  Controller, Get, Post, Body, Patch, Param, Delete, Query,
  UseGuards, ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { SallesService } from './salles.service';
import { CreateSalleDto } from './dto/create-salle.dto';
import { UpdateSalleDto } from './dto/update-salle.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/constants';

@ApiTags('Salles')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.RESPONSABLE_INFRASTRUCTURE)
@ApiBearerAuth()
@Controller('salles')
export class SallesController {
  constructor(private readonly sallesService: SallesService) {}

  @Post()
  @ApiOperation({ summary: 'Créer une salle' })
  @ApiResponse({ status: 201, description: 'Salle créée' })
  create(@Body() dto: CreateSalleDto) {
    return this.sallesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lister les salles' })
  @ApiQuery({ name: 'batimentId', required: false, example: 1 })
  findAll(@Query('batimentId') batimentId?: string) {
    return this.sallesService.findAll(batimentId ? parseInt(batimentId) : undefined);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Détail d\'une salle' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.sallesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Modifier une salle' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSalleDto) {
    return this.sallesService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Supprimer une salle' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.sallesService.remove(id);
  }
}
