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

@Injectable()
export class EtablissementsService {
  private readonly logger = new Logger(EtablissementsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly r2Service: R2Service,
  ) {}

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
          commune: true,
          fokontany: true,
          quartier: true,
          couvTelephonique: true,
          couvInternet: true,
          nbEnseignantG: true,
          nbEnseignantF: true,
          nbSectionG: true,
          nbSectionF: true,
        },
        orderBy: { nomEtab: 'asc' },
      });
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

  async remove(id: number) {
    const etablissement = await this.findOne(id);

    // Supprimer les photos du bucket R2
    for (const photo of etablissement.photos) {
      try {
        await this.r2Service.deleteFile(photo.key);
      } catch (error) {
        this.logger.warn(
          `Impossible de supprimer la photo R2: ${photo.key}`,
          error,
        );
      }
    }

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
