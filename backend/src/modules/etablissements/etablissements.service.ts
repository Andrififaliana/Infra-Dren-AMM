import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../common/services/audit.service';
import { R2Service } from '../../r2/r2.service';
import { Prisma } from '@prisma/client';
import { CreateEtablissementDto } from './dto/create-etablissement.dto';
import { UpdateEtablissementDto } from './dto/update-etablissement.dto';
import { EtablissementQueryDto } from './dto/etablissement-query.dto';
import { UpsertDirecteurDto } from './dto/upsert-directeur.dto';
import { CreateDesignationDto } from './dto/create-designation.dto';
import { UpdateDesignationDto } from './dto/update-designation.dto';
import { CreateStructureDto } from './dto/create-structure.dto';
import { UpdateStructureDto } from './dto/update-structure.dto';

@Injectable()
export class EtablissementsService {
  private readonly logger = new Logger(EtablissementsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly r2Service: R2Service,
  ) {}

  /**
   * Remplace les URLs directes R2 par des URLs présignées (valides 1h)
   * pour un tableau de photos. Les objets sont mutés sur place.
   * Conserve l'URL directe en fallback si la génération échoue.
   */
  private async signPhotoUrls(
    photos: Array<{ key: string; url: string }>,
  ): Promise<void> {
    await Promise.all(
      photos.map(async (photo) => {
        if (!photo.key) {
          this.logger.warn(`Photo sans clé R2, conservation de l'URL directe: ${photo.url?.substring(0, 60)}`);
          return;
        }
        try {
          photo.url = await this.r2Service.getPresignedUrl(photo.key);
        } catch (error) {
          this.logger.warn(
            `Impossible de générer une URL présignée pour ${photo.key}, garde l'URL directe en fallback`,
            error instanceof Error ? error.message : error,
          );
        }
      }),
    );
  }

  async create(dto: CreateEtablissementDto) {
    const etablissement = await this.prisma.etablissement.create({
      data: dto,
      include: { photos: true },
    });
    await this.auditService.creation(
      'ETABLISSEMENT',
      etablissement.id,
      etablissement.nomEtab,
    );
    return etablissement;
  }

  async findAll(query: EtablissementQueryDto) {
    const pageNumber = Number(query.page ?? 1);
    const limitNumber = Number(query.limit ?? 10);
    const page = Number.isFinite(pageNumber) && pageNumber > 0 ? pageNumber : 1;
    const limit =
      Number.isFinite(limitNumber) && limitNumber > 0 ? limitNumber : 10;
    const skip = (page - 1) * limit;

    const where: Prisma.EtablissementWhereInput = {};

    if (query.search) {
      where.OR = [
        { nomEtab: { contains: query.search, mode: 'insensitive' } },
        { dren: { contains: query.search, mode: 'insensitive' } },
        { cisco: { contains: query.search, mode: 'insensitive' } },
        { commune: { contains: query.search, mode: 'insensitive' } },
        { fokontany: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    if (query.dren) {
      where.dren = { contains: query.dren, mode: 'insensitive' };
    }
    if (query.cisco) {
      where.cisco = { contains: query.cisco, mode: 'insensitive' };
    }
    if (query.zap) {
      where.zap = { contains: query.zap, mode: 'insensitive' };
    }
    if (query.commune) {
      where.commune = { contains: query.commune, mode: 'insensitive' };
    }

    try {
      const data = await this.prisma.etablissement.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          nomEtab: true,
          dren: true,
          cisco: true,
          zap: true,
          commune: true,
          fokontany: true,
          quartier: true,
          latitude: true,
          longitude: true,
          couvTelephonique: true,
          couvInternet: true,
          nbEnseignantG: true,
          nbEnseignantF: true,
          nbSectionG: true,
          nbSectionF: true,
          photos: {
            select: {
              id: true,
              key: true,
              url: true,
              originalName: true,
              mimeType: true,
              fileSize: true,
              estPrincipale: true,
              etablissementId: true,
              createdAt: true,
            },
            take: 1,
            orderBy: { estPrincipale: 'desc' },
          },
          _count: {
            select: {
              batiments: true,
              designations: true,
              structures: true,
              photos: true,
            },
          },
        },
        orderBy: { nomEtab: 'asc' },
      });

      // Signer les URLs des photos pour tous les établissements en parallèle
      await Promise.all(
        data.map((etab) =>
          etab.photos?.length
            ? this.signPhotoUrls(etab.photos as Array<{ key: string; url: string }>)
            : Promise.resolve(),
        ),
      );

      const total = await this.prisma.etablissement.count({ where });

      return {
        data,
        meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
      };
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Erreur inconnue lors du chargement des établissements';
      this.logger.error(
        `Erreur lors du chargement des établissements: ${message}`,
      );
      throw new BadRequestException(
        'Impossible de charger les établissements. Vérifiez la configuration de la base de données.',
      );
    }
  }

  async findOne(id: number) {
    const etablissement = await this.prisma.etablissement.findUnique({
      where: { id },
      include: {
        directeur: true,
        designations: true,
        structures: true,
        photos: { orderBy: { estPrincipale: 'desc' } },
        batiments: {
          include: {
            salles: {
              include: {
                _count: { select: { equipements: true, ouvertures: true } },
              },
            },
            toilettes: true,
          },
        },
        _count: {
          select: {
            batiments: true,
            designations: true,
            structures: true,
            photos: true,
          },
        },
      },
    });
    if (!etablissement)
      throw new NotFoundException(`Établissement #${id} non trouvé`);

    // Signer les URLs des photos
    if (etablissement.photos?.length) {
      await this.signPhotoUrls(
        etablissement.photos as Array<{ key: string; url: string }>,
      );
    }

    return etablissement;
  }

  async update(id: number, dto: UpdateEtablissementDto) {
    await this.findOne(id);
    const etablissement = await this.prisma.etablissement.update({
      where: { id },
      data: dto,
    });
    await this.auditService.modification(
      'ETABLISSEMENT',
      id,
      etablissement.nomEtab,
    );
    return etablissement;
  }

  async findOneExport(id: number) {
    const etablissement = await this.prisma.etablissement.findUnique({
      where: { id },
      include: {
        directeur: true,
        designations: true,
        structures: true,
        photos: { orderBy: { estPrincipale: 'desc' } },
        batiments: {
          include: {
            photos: { orderBy: { estPrincipale: 'desc' } },
            toilettes: true,
            salles: {
              include: {
                equipements: true,
                ouvertures: true,
                photos: { orderBy: { estPrincipale: 'desc' } },
              },
            },
          },
        },
        _count: {
          select: {
            batiments: true,
            designations: true,
            structures: true,
            photos: true,
          },
        },
      },
    });
    if (!etablissement)
      throw new NotFoundException(`Établissement #${id} non trouvé`);

    // Signer les URLs des photos
    if (etablissement.photos?.length) {
      await this.signPhotoUrls(
        etablissement.photos as Array<{ key: string; url: string }>,
      );
    }
    for (const batiment of etablissement.batiments) {
      if (batiment.photos?.length) {
        await this.signPhotoUrls(
          batiment.photos as Array<{ key: string; url: string }>,
        );
      }
      for (const salle of batiment.salles) {
        if (salle.photos?.length) {
          await this.signPhotoUrls(
            salle.photos as Array<{ key: string; url: string }>,
          );
        }
      }
    }

    return etablissement;
  }

  async remove(id: number) {
    const etablissement = await this.prisma.etablissement.findUnique({
      where: { id },
      include: {
        photos: { select: { key: true } },
        batiments: {
          include: {
            photos: { select: { key: true } },
            salles: {
              include: {
                photos: { select: { key: true } },
              },
            },
          },
        },
      },
    });
    if (!etablissement)
      throw new NotFoundException(`Établissement #${id} non trouvé`);

    // Collecter toutes les clés de photos pour suppression R2
    const photoKeys: string[] = [
      ...etablissement.photos.map((p) => p.key),
      ...etablissement.batiments.flatMap((b) => b.photos.map((p) => p.key)),
      ...etablissement.batiments.flatMap((b) =>
        b.salles.flatMap((s) => s.photos.map((p) => p.key)),
      ),
    ];

    for (const key of photoKeys) {
      try {
        await this.r2Service.deleteFile(key);
      } catch (error) {
        this.logger.warn(`Impossible de supprimer la photo R2: ${key}`, error);
      }
    }

    // La cascade Prisma (onDelete: Cascade) supprime automatiquement
    // tous les enregistrements enfants (photos, batiments, salles, etc.)
    await this.prisma.etablissement.delete({ where: { id } });
    await this.auditService.suppression('ETABLISSEMENT', id);
  }

  /** Uploader une photo pour un établissement */
  async uploadPhoto(
    etablissementId: number,
    file: Express.Multer.File,
    estPrincipale: boolean,
  ) {
    const etablissement = await this.prisma.etablissement.findUnique({
      where: { id: etablissementId },
    });
    if (!etablissement)
      throw new NotFoundException(
        `Établissement #${etablissementId} non trouvé`,
      );

    // Valider le type de fichier
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
    ];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Format de fichier non supporté. Utilisez jpg, png, webp ou gif.',
      );
    }

    // Limiter la taille à 10 Mo
    if (file.size > 10 * 1024 * 1024) {
      throw new BadRequestException('Le fichier ne doit pas dépasser 10 Mo.');
    }

    // Générer une clé unique
    const key = R2Service.generatePhotoKey(etablissementId, file.originalname);

    // Upload vers R2
    const { url } = await this.r2Service.uploadFile(
      key,
      file.buffer,
      file.mimetype,
    );

    // Si c'est la photo principale, retirer le flag des autres photos
    if (estPrincipale) {
      await this.prisma.photo.updateMany({
        where: { etablissementId, estPrincipale: true },
        data: { estPrincipale: false },
      });
    }

    // Créer l'enregistrement en base
    const photo = await this.prisma.photo.create({
      data: {
        key,
        url,
        originalName: file.originalname,
        mimeType: file.mimetype,
        fileSize: file.size,
        estPrincipale,
        etablissementId,
      },
    });

    await this.auditService.modification(
      'ETABLISSEMENT',
      etablissementId,
      `Photo ajoutée: ${file.originalname}`,
    );
    return photo;
  }

  /** Uploader plusieurs photos pour un établissement */
  async uploadMultiplePhotos(
    etablissementId: number,
    files: Express.Multer.File[],
    principaleIndex: number,
  ) {
    const etablissement = await this.prisma.etablissement.findUnique({
      where: { id: etablissementId },
    });
    if (!etablissement)
      throw new NotFoundException(
        `Établissement #${etablissementId} non trouvé`,
      );

    if (!files || files.length === 0) {
      throw new BadRequestException('Aucun fichier fourni.');
    }

    if (files.length > 10) {
      throw new BadRequestException('Maximum 10 photos par upload.');
    }

    // Valider et uploader chaque fichier
    const results: Array<{ success: boolean; photo?: any; error?: string }> =
      [];
    let successCount = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const estPrincipale = i === principaleIndex;

      try {
        // Valider le type MIME
        const allowedMimeTypes = [
          'image/jpeg',
          'image/png',
          'image/webp',
          'image/gif',
        ];
        if (!allowedMimeTypes.includes(file.mimetype)) {
          results.push({
            success: false,
            error: `${file.originalname}: Format non supporté`,
          });
          continue;
        }

        // Limiter la taille à 10 Mo
        if (file.size > 10 * 1024 * 1024) {
          results.push({
            success: false,
            error: `${file.originalname}: Fichier trop volumineux (max 10 Mo)`,
          });
          continue;
        }

        const key = R2Service.generatePhotoKey(
          etablissementId,
          file.originalname,
        );
        const { url } = await this.r2Service.uploadFile(
          key,
          file.buffer,
          file.mimetype,
        );

        // Si c'est la photo principale, retirer le flag des autres
        if (estPrincipale) {
          await this.prisma.photo.updateMany({
            where: { etablissementId, estPrincipale: true },
            data: { estPrincipale: false },
          });
        }

        const photo = await this.prisma.photo.create({
          data: {
            key,
            url,
            originalName: file.originalname,
            mimeType: file.mimetype,
            fileSize: file.size,
            estPrincipale,
            etablissementId,
          },
        });

        results.push({ success: true, photo });
        successCount++;
      } catch (error) {
        this.logger.error(`Erreur upload ${file.originalname}: ${error}`);
        results.push({
          success: false,
          error: `${file.originalname}: Erreur lors de l'upload`,
        });
      }
    }

    await this.auditService.modification(
      'ETABLISSEMENT',
      etablissementId,
      `${successCount}/${files.length} photos ajoutées`,
    );

    return { results, total: files.length, successCount };
  }

  // ─── Directeur ─────────────────────────────────────

  async upsertDirecteur(etablissementId: number, dto: UpsertDirecteurDto) {
    await this.findOne(etablissementId);
    const directeur = await this.prisma.directeur.upsert({
      where: { etablissementId },
      update: dto,
      create: { ...dto, etablissementId },
    });
    await this.auditService.modification('ETABLISSEMENT', etablissementId, 'Directeur mis à jour');
    return directeur;
  }

  async deleteDirecteur(etablissementId: number) {
    const etab = await this.findOne(etablissementId);
    if (!etab.directeur) throw new NotFoundException('Aucun directeur pour cet établissement');
    await this.prisma.directeur.delete({ where: { etablissementId } });
    await this.auditService.modification('ETABLISSEMENT', etablissementId, 'Directeur supprimé');
  }

  // ─── Designations ───────────────────────────────────

  async createDesignation(etablissementId: number, dto: CreateDesignationDto) {
    await this.findOne(etablissementId);
    const designation = await this.prisma.designation.create({
      data: { ...dto, etablissementId },
    });
    await this.auditService.modification('ETABLISSEMENT', etablissementId, `Désignation ajoutée: ${dto.nomDesign}`);
    return designation;
  }

  async updateDesignation(id: number, etablissementId: number, dto: UpdateDesignationDto) {
    const existing = await this.prisma.designation.findFirst({ where: { idDesign: id, etablissementId } });
    if (!existing) throw new NotFoundException(`Désignation #${id} non trouvée`);
    const designation = await this.prisma.designation.update({ where: { idDesign: id }, data: dto });
    await this.auditService.modification('ETABLISSEMENT', etablissementId, 'Désignation modifiée');
    return designation;
  }

  async deleteDesignation(id: number, etablissementId: number) {
    const existing = await this.prisma.designation.findFirst({ where: { idDesign: id, etablissementId } });
    if (!existing) throw new NotFoundException(`Désignation #${id} non trouvée`);
    await this.prisma.designation.delete({ where: { idDesign: id } });
    await this.auditService.modification('ETABLISSEMENT', etablissementId, 'Désignation supprimée');
  }

  // ─── Structures ─────────────────────────────────────

  async createStructure(etablissementId: number, dto: CreateStructureDto) {
    await this.findOne(etablissementId);
    const structure = await this.prisma.structure.create({
      data: { ...dto, etablissementId },
    });
    await this.auditService.modification('ETABLISSEMENT', etablissementId, 'Structure ajoutée');
    return structure;
  }

  async updateStructure(id: number, etablissementId: number, dto: UpdateStructureDto) {
    const existing = await this.prisma.structure.findFirst({ where: { idStruc: id, etablissementId } });
    if (!existing) throw new NotFoundException(`Structure #${id} non trouvée`);
    const structure = await this.prisma.structure.update({ where: { idStruc: id }, data: dto });
    await this.auditService.modification('ETABLISSEMENT', etablissementId, 'Structure modifiée');
    return structure;
  }

  async deleteStructure(id: number, etablissementId: number) {
    const existing = await this.prisma.structure.findFirst({ where: { idStruc: id, etablissementId } });
    if (!existing) throw new NotFoundException(`Structure #${id} non trouvée`);
    await this.prisma.structure.delete({ where: { idStruc: id } });
    await this.auditService.modification('ETABLISSEMENT', etablissementId, 'Structure supprimée');
  }

  /** Définir une photo comme principale */
  async setPhotoPrincipale(
    etablissementId: number,
    photoId: number,
    estPrincipale: boolean,
  ) {
    const photo = await this.prisma.photo.findFirst({
      where: { id: photoId, etablissementId },
    });
    if (!photo) throw new NotFoundException(`Photo #${photoId} non trouvée`);

    if (estPrincipale) {
      // Retirer le flag principal de toutes les autres photos
      await this.prisma.photo.updateMany({
        where: { etablissementId, estPrincipale: true },
        data: { estPrincipale: false },
      });
    }

    const updated = await this.prisma.photo.update({
      where: { id: photoId },
      data: { estPrincipale },
    });

    await this.auditService.modification(
      'ETABLISSEMENT',
      etablissementId,
      `Photo ${estPrincipale ? 'définie comme principale' : 'retirée comme principale'}`,
    );
    return updated;
  }

  /** Supprimer une photo */
  async deletePhoto(etablissementId: number, photoId: number) {
    const photo = await this.prisma.photo.findFirst({
      where: { id: photoId, etablissementId },
    });
    if (!photo) throw new NotFoundException(`Photo #${photoId} non trouvée`);

    // Supprimer du bucket R2
    try {
      await this.r2Service.deleteFile(photo.key);
    } catch (error) {
      this.logger.warn(`Erreur lors de la suppression R2: ${photo.key}`, error);
    }

    await this.prisma.photo.delete({ where: { id: photoId } });
    await this.auditService.modification(
      'ETABLISSEMENT',
      etablissementId,
      'Photo supprimée',
    );
  }
}
