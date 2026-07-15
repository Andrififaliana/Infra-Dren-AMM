import {
  Controller, Get, Post, Body, Patch, Param, Delete,
  UseGuards, ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AleasService } from './aleas.service';
import { CreateAleaDto } from './dto/create-alea.dto';
import { UpdateAleaDto } from './dto/update-alea.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { Role } from '../../common/constants';

@ApiTags('Aléas')
@Controller('aleas')
export class AleasController {
  constructor(private readonly service: AleasService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.RESPONSABLE_INFRASTRUCTURE)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Créer un aléa' })
  create(@Body() dto: CreateAleaDto) { return this.service.create(dto); }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Lister les aléas' })
  findAll() { return this.service.findAll(); }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Détail d\'un aléa' })
  findOne(@Param('id', ParseIntPipe) id: number) { return this.service.findOne(id); }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.RESPONSABLE_INFRASTRUCTURE)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Modifier un aléa' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateAleaDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Supprimer un aléa' })
  remove(@Param('id', ParseIntPipe) id: number) { return this.service.remove(id); }
}
