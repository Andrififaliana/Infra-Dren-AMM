import {
  Controller, Get, Post, Body, Patch, Param, Delete,
  UseGuards, ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TrajetsService } from './trajets.service';
import { CreateTrajetDto } from './dto/create-trajet.dto';
import { UpdateTrajetDto } from './dto/update-trajet.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { Role } from '../../common/constants';

@ApiTags('Trajets')
@Controller('trajets')
export class TrajetsController {
  constructor(private readonly service: TrajetsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.RESPONSABLE_INFRASTRUCTURE)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Créer un trajet' })
  create(@Body() dto: CreateTrajetDto) { return this.service.create(dto); }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Lister les trajets' })
  findAll() { return this.service.findAll(); }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Détail d\'un trajet' })
  findOne(@Param('id', ParseIntPipe) id: number) { return this.service.findOne(id); }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.RESPONSABLE_INFRASTRUCTURE)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Modifier un trajet' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTrajetDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Supprimer un trajet' })
  remove(@Param('id', ParseIntPipe) id: number) { return this.service.remove(id); }
}
