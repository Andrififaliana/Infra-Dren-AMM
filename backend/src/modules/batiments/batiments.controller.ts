import {
  Controller, Get, Post, Body, Patch, Param, Delete, Query,
  UseGuards, ParseIntPipe, UseInterceptors, UploadedFile, UploadedFiles,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery,
  ApiConsumes, ApiBody,
} from '@nestjs/swagger';
import { BatimentsService } from './batiments.service';
import { CreateBatimentDto } from './dto/create-batiment.dto';
import { UpdateBatimentDto } from './dto/update-batiment.dto';
import { CreateToiletteDto } from './dto/create-toilette.dto';
import { UpdateToiletteDto } from './dto/update-toilette.dto';
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

  // ─── Photos ────────────────────────────────────────

  @Post(':id/photos')
  @ApiOperation({ summary: 'Uploader une photo pour un bâtiment' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' }, estPrincipale: { type: 'string' } } } })
  @UseInterceptors(FileInterceptor('file'))
  async uploadPhoto(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
    @Body('estPrincipale') estPrincipale?: string,
  ) {
    return this.batimentsService.uploadPhoto(id, file, estPrincipale === 'true');
  }

  @Post(':id/photos/multiple')
  @ApiOperation({ summary: 'Uploader plusieurs photos pour un bâtiment (max 10)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { files: { type: 'array', items: { type: 'string', format: 'binary' } }, estPrincipale: { type: 'string' } } } })
  @UseInterceptors(FilesInterceptor('files', 10, { limits: { fileSize: 10 * 1024 * 1024 } }))
  async uploadMultiplePhotos(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFiles() files: Express.Multer.File[],
    @Body('estPrincipale') estPrincipale?: string,
  ) {
    const principaleIndex = estPrincipale !== undefined ? (isNaN(parseInt(estPrincipale, 10)) ? 0 : parseInt(estPrincipale, 10)) : 0;
    return this.batimentsService.uploadMultiplePhotos(id, files, principaleIndex);
  }

  @Patch(':id/photos/:photoId')
  @ApiOperation({ summary: 'Définir une photo comme principale' })
  setPhotoPrincipale(
    @Param('id', ParseIntPipe) id: number,
    @Param('photoId', ParseIntPipe) photoId: number,
    @Body('estPrincipale') estPrincipale?: string,
  ) {
    return this.batimentsService.setPhotoPrincipale(id, photoId, estPrincipale !== 'false');
  }

  @Delete(':id/photos/:photoId')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Supprimer une photo d\'un bâtiment' })
  deletePhoto(
    @Param('id', ParseIntPipe) id: number,
    @Param('photoId', ParseIntPipe) photoId: number,
  ) {
    return this.batimentsService.deletePhoto(id, photoId);
  }

  // ─── Toilettes ──────────────────────────────────────

  @Post(':id/toilettes')
  @ApiOperation({ summary: 'Ajouter une toilette à un bâtiment' })
  createToilette(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateToiletteDto,
  ) {
    return this.batimentsService.createToilette(id, dto);
  }

  @Patch(':id/toilettes/:toiletteId')
  @ApiOperation({ summary: 'Modifier une toilette' })
  updateToilette(
    @Param('id', ParseIntPipe) id: number,
    @Param('toiletteId', ParseIntPipe) toiletteId: number,
    @Body() dto: UpdateToiletteDto,
  ) {
    return this.batimentsService.updateToilette(toiletteId, id, dto);
  }

  @Delete(':id/toilettes/:toiletteId')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Supprimer une toilette' })
  deleteToilette(
    @Param('id', ParseIntPipe) id: number,
    @Param('toiletteId', ParseIntPipe) toiletteId: number,
  ) {
    return this.batimentsService.deleteToilette(toiletteId, id);
  }
}
