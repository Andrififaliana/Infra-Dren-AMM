import {
  Controller, Get, Post, Body, Patch, Param, Delete, Query,
  UseGuards, ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { BatimentsService } from './batiments.service';
import { CreateBatimentDto } from './dto/create-batiment.dto';
import { UpdateBatimentDto } from './dto/update-batiment.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/constants';

@ApiTags('Bâtiments')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.RESPONSABLE_INFRASTRUCTURE)
@ApiBearerAuth()
@Controller('batiments')
export class BatimentsController {
  constructor(private readonly batimentsService: BatimentsService) {}

  @Post()
  @ApiOperation({ summary: 'Créer un bâtiment' })
  @ApiResponse({ status: 201, description: 'Bâtiment créé' })
  create(@Body() dto: CreateBatimentDto) {
    return this.batimentsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lister les bâtiments' })
  @ApiQuery({ name: 'etablissementId', required: false, example: 1 })
  @ApiResponse({ status: 200, description: 'Liste des bâtiments' })
  findAll(@Query('etablissementId') etablissementId?: string) {
    return this.batimentsService.findAll(etablissementId ? parseInt(etablissementId) : undefined);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Détail d\'un bâtiment' })
  @ApiResponse({ status: 200, description: 'Bâtiment trouvé' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.batimentsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Modifier un bâtiment' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateBatimentDto) {
    return this.batimentsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Supprimer un bâtiment' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.batimentsService.remove(id);
  }
}
