import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { EtablissementsService } from './etablissements.service';
import { CreateEtablissementDto } from './dto/create-etablissement.dto';
import { UpdateEtablissementDto } from './dto/update-etablissement.dto';
import { EtablissementQueryDto } from './dto/etablissement-query.dto';
import { UpsertDirecteurDto } from './dto/upsert-directeur.dto';
import { CreateDesignationDto } from './dto/create-designation.dto';
import { UpdateDesignationDto } from './dto/update-designation.dto';
import { CreateStructureDto } from './dto/create-structure.dto';
import { UpdateStructureDto } from './dto/update-structure.dto';
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
  @ApiOperation({
    summary: 'Lister les établissements',
    description: 'Liste paginée avec recherche et filtres',
  })
  @ApiResponse({ status: 200, description: 'Liste des établissements' })
  findAll(@Query() query: EtablissementQueryDto) {
    return this.etablissementsService.findAll(query);
  }

  @Get(':id')
  @Public()
  @ApiOperation({
    summary: "Détail d'un établissement avec toutes ses relations",
  })
  @ApiResponse({ status: 200, description: 'Établissement trouvé' })
  @ApiResponse({ status: 404, description: 'Non trouvé' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.etablissementsService.findOne(id);
  }

  @Get(':id/export')
  @Public()
  @ApiOperation({
    summary: "Export complet d'un établissement pour génération PDF",
    description: "Retourne toutes les données avec les relations imbriquées (salles, équipements, photos...)",
  })
  @ApiResponse({ status: 200, description: 'Données export' })
  @ApiResponse({ status: 404, description: 'Non trouvé' })
  findOneExport(@Param('id', ParseIntPipe) id: number) {
    return this.etablissementsService.findOneExport(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.RESPONSABLE_INFRASTRUCTURE)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Modifier un établissement' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEtablissementDto,
  ) {
    return this.etablissementsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.RESPONSABLE_INFRASTRUCTURE)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Supprimer un établissement' })
  @ApiResponse({ status: 200, description: 'Supprimé' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.etablissementsService.remove(id);
  }

  @Post(':id/photos')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.RESPONSABLE_INFRASTRUCTURE)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Uploader une photo pour un établissement' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Photo (jpg, png, webp)',
        },
        estPrincipale: {
          type: 'string',
          description: 'true si cette photo doit être la photo principale',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadPhoto(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
    @Body('estPrincipale') estPrincipale?: string,
  ) {
    return this.etablissementsService.uploadPhoto(
      id,
      file,
      estPrincipale === 'true',
    );
  }

  @Post(':id/photos/multiple')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.RESPONSABLE_INFRASTRUCTURE)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Uploader plusieurs photos pour un établissement (max 10)',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
          description: "Photos (jpg, png, webp, gif) - jusqu'à 10 fichiers",
        },
        estPrincipale: {
          type: 'string',
          description:
            'Index de la photo à définir comme principale (ex: "0" pour la première)',
        },
      },
    },
  })
  @UseInterceptors(
    FilesInterceptor('files', 10, { limits: { fileSize: 10 * 1024 * 1024 } }),
  )
  async uploadMultiplePhotos(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFiles() files: Express.Multer.File[],
    @Body('estPrincipale') estPrincipale?: string,
  ) {
    const principaleIndex =
      estPrincipale !== undefined
        ? isNaN(parseInt(estPrincipale, 10))
          ? 0
          : parseInt(estPrincipale, 10)
        : 0;
    return this.etablissementsService.uploadMultiplePhotos(
      id,
      files,
      principaleIndex,
    );
  }

  @Patch(':id/photos/:photoId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.RESPONSABLE_INFRASTRUCTURE)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Définir une photo comme principale" })
  setPhotoPrincipale(
    @Param('id', ParseIntPipe) id: number,
    @Param('photoId', ParseIntPipe) photoId: number,
    @Body('estPrincipale') estPrincipale?: string,
  ) {
    return this.etablissementsService.setPhotoPrincipale(
      id,
      photoId,
      estPrincipale !== 'false',
    );
  }

  @Delete(':id/photos/:photoId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.RESPONSABLE_INFRASTRUCTURE)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Supprimer une photo d'un établissement" })
  deletePhoto(
    @Param('id', ParseIntPipe) id: number,
    @Param('photoId', ParseIntPipe) photoId: number,
  ) {
    return this.etablissementsService.deletePhoto(id, photoId);
  }

  // ─── Directeur ───────────────────────────────────────

  @Post(':id/directeur')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.RESPONSABLE_INFRASTRUCTURE)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Créer ou mettre à jour le directeur d'un établissement" })
  upsertDirecteur(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpsertDirecteurDto,
  ) {
    return this.etablissementsService.upsertDirecteur(id, dto);
  }

  @Delete(':id/directeur')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Supprimer le directeur d'un établissement" })
  deleteDirecteur(@Param('id', ParseIntPipe) id: number) {
    return this.etablissementsService.deleteDirecteur(id);
  }

  // ─── Designations ────────────────────────────────────

  @Post(':id/designations')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.RESPONSABLE_INFRASTRUCTURE)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Ajouter une désignation à un établissement" })
  createDesignation(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateDesignationDto,
  ) {
    return this.etablissementsService.createDesignation(id, dto);
  }

  @Patch(':id/designations/:designationId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.RESPONSABLE_INFRASTRUCTURE)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Modifier une désignation" })
  updateDesignation(
    @Param('id', ParseIntPipe) id: number,
    @Param('designationId', ParseIntPipe) designationId: number,
    @Body() dto: UpdateDesignationDto,
  ) {
    return this.etablissementsService.updateDesignation(designationId, id, dto);
  }

  @Delete(':id/designations/:designationId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Supprimer une désignation" })
  deleteDesignation(
    @Param('id', ParseIntPipe) id: number,
    @Param('designationId', ParseIntPipe) designationId: number,
  ) {
    return this.etablissementsService.deleteDesignation(designationId, id);
  }

  // ─── Structures ──────────────────────────────────────

  @Post(':id/structures')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.RESPONSABLE_INFRASTRUCTURE)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Ajouter une structure à un établissement" })
  createStructure(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateStructureDto,
  ) {
    return this.etablissementsService.createStructure(id, dto);
  }

  @Patch(':id/structures/:structureId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.RESPONSABLE_INFRASTRUCTURE)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Modifier une structure" })
  updateStructure(
    @Param('id', ParseIntPipe) id: number,
    @Param('structureId', ParseIntPipe) structureId: number,
    @Body() dto: UpdateStructureDto,
  ) {
    return this.etablissementsService.updateStructure(structureId, id, dto);
  }

  @Delete(':id/structures/:structureId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Supprimer une structure" })
  deleteStructure(
    @Param('id', ParseIntPipe) id: number,
    @Param('structureId', ParseIntPipe) structureId: number,
  ) {
    return this.etablissementsService.deleteStructure(structureId, id);
  }
}
