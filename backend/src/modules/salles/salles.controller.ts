import {
  Controller, Get, Post, Body, Patch, Param, Delete, Query,
  UseGuards, ParseIntPipe, UseInterceptors, UploadedFile, UploadedFiles,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiConsumes } from '@nestjs/swagger';
import { SallesService } from './salles.service';
import { CreateSalleDto } from './dto/create-salle.dto';
import { UpdateSalleDto } from './dto/update-salle.dto';
import { CreateOuvertureDto } from './dto/create-ouverture.dto';
import { UpdateOuvertureDto } from './dto/update-ouverture.dto';
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

  // ─── Ouvertures ─────────────────────────────────────

  @Post(':id/ouvertures')
  @ApiOperation({ summary: 'Ajouter une ouverture (fenêtre/porte) à une salle' })
  createOuverture(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateOuvertureDto,
  ) {
    return this.sallesService.createOuverture(id, dto);
  }

  @Patch(':id/ouvertures/:ouvertureId')
  @ApiOperation({ summary: 'Modifier une ouverture' })
  updateOuverture(
    @Param('id', ParseIntPipe) id: number,
    @Param('ouvertureId', ParseIntPipe) ouvertureId: number,
    @Body() dto: UpdateOuvertureDto,
  ) {
    return this.sallesService.updateOuverture(ouvertureId, id, dto);
  }

  @Delete(':id/ouvertures/:ouvertureId')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Supprimer une ouverture' })
  deleteOuverture(
    @Param('id', ParseIntPipe) id: number,
    @Param('ouvertureId', ParseIntPipe) ouvertureId: number,
  ) {
    return this.sallesService.deleteOuverture(ouvertureId, id);
  }

  // ─── Photos ─────────────────────────────────────────────

  @Post(':id/photos')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Uploader une photo pour une salle' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Photo uploadée' })
  uploadPhoto(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.sallesService.uploadPhoto(id, file);
  }

  @Post(':id/photos/multiple')
  @UseInterceptors(FilesInterceptor('files', 10))
  @ApiOperation({ summary: 'Uploader plusieurs photos' })
  @ApiConsumes('multipart/form-data')
  uploadMultiplePhotos(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.sallesService.uploadMultiplePhotos(id, files);
  }

  @Patch(':id/photos/:photoId')
  @ApiOperation({ summary: 'Définir une photo comme principale' })
  setPhotoPrincipale(
    @Param('id', ParseIntPipe) id: number,
    @Param('photoId', ParseIntPipe) photoId: number,
    @Body() body: { estPrincipale: string },
  ) {
    if (body.estPrincipale === 'true') {
      return this.sallesService.setPhotoPrincipale(id, photoId);
    }
    return { message: 'Rien à faire' };
  }

  @Delete(':id/photos/:photoId')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Supprimer une photo' })
  deletePhoto(
    @Param('id', ParseIntPipe) id: number,
    @Param('photoId', ParseIntPipe) photoId: number,
  ) {
    return this.sallesService.deletePhoto(id, photoId);
  }
}
