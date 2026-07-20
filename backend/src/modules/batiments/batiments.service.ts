import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../common/services/audit.service';
import { R2Service } from '../../r2/r2.service';
import { CreateBatimentDto } from './dto/create-batiment.dto';
import { UpdateBatimentDto } from './dto/update-batiment.dto';
import { CreateToiletteDto } from './dto/create-toilette.dto';
import { UpdateToiletteDto } from './dto/update-toilette.dto';

@Injectable()
export class BatimentsService {
  private readonly logger = new Logger(BatimentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly r2Service: R2Service,
  ) {}

  async create(dto: CreateBatimentDto) {
    const batiment = await this.prisma.batiment.create({ data: dto });
    await this.auditService.creation('BATIMENT', batiment.idBat, batiment.sigleBat ?? undefined);
    return batiment;
  }

  async findAll(etablissementId?: number) {
    const where = etablissementId ? { etablissementId } : {};
    return this.prisma.batiment.findMany({
      where,
      include: { _count: { select: { salles: true, toilettes: true } }, etablissement: { select: { id: true, nomEtab: true } } },
      orderBy: { sigleBat: 'asc' },
    });
  }

  async findOne(id: number) {
    const batiment = await this.prisma.batiment.findUnique({
      where: { idBat: id },
      include: { etablissement: { select: { id: true, nomEtab: true } }, salles: { include: { _count: { select: { equipements: true, ouvertures: true } } } }, toilettes: true, photos: { orderBy: { estPrincipale: 'desc' } } },
    });
    if (!batiment) throw new NotFoundException(`Bâtiment #${id} non trouvé`);

    // Signer les URLs des photos
    if (batiment.photos?.length) {
      await this.signPhotoUrls(
        batiment.photos as Array<{ key: string; url: string }>,
      );
    }

    return batiment;
  }

  async update(id: number, dto: UpdateBatimentDto) {
    await this.findOne(id);
    const batiment = await this.prisma.batiment.update({ where: { idBat: id }, data: dto });
    await this.auditService.modification('BATIMENT', id, batiment.sigleBat ?? undefined);
    return batiment;
  }

  async remove(id: number) {
    const batiment = await this.findOne(id);

    // Supprimer les photos du bucket R2
    for (const photo of batiment.photos) {
      try {
        await this.r2Service.deleteFile(photo.key);
      } catch (error) {
        this.logger.warn(`Impossible de supprimer la photo R2: ${photo.key}`, error);
      }
    }

    await this.prisma.batiment.delete({ where: { idBat: id } });
    await this.auditService.suppression('BATIMENT', id);
  }

  // ─── Photos ────────────────────────────────────────

  private async signPhotoUrls(photos: Array<{ key: string; url: string }>): Promise<void> {
    await Promise.all(
      photos.map(async (photo) => {
        try {
          photo.url = await this.r2Service.getPresignedUrl(photo.key);
        } catch (error) {
          this.logger.warn(`Impossible de générer une URL présignée pour ${photo.key}`, error);
        }
      }),
    );
  }

  async uploadPhoto(batimentId: number, file: Express.Multer.File, estPrincipale: boolean) {
    const batiment = await this.prisma.batiment.findUnique({ where: { idBat: batimentId } });
    if (!batiment) throw new NotFoundException(`Bâtiment #${batimentId} non trouvé`);

    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Format de fichier non supporté. Utilisez jpg, png, webp ou gif.');
    }
    if (file.size > 10 * 1024 * 1024) {
      throw new BadRequestException('Le fichier ne doit pas dépasser 10 Mo.');
    }

    const key = R2Service.generateBatimentPhotoKey(batimentId, file.originalname);
    const { url } = await this.r2Service.uploadFile(key, file.buffer, file.mimetype);

    if (estPrincipale) {
      await this.prisma.batimentPhoto.updateMany({
        where: { batimentId, estPrincipale: true },
        data: { estPrincipale: false },
      });
    }

    const photo = await this.prisma.batimentPhoto.create({
      data: { key, url, originalName: file.originalname, mimeType: file.mimetype, fileSize: file.size, estPrincipale, batimentId },
    });

    await this.auditService.modification('BATIMENT', batimentId, `Photo ajoutée: ${file.originalname}`);
    return photo;
  }

  async uploadMultiplePhotos(batimentId: number, files: Express.Multer.File[], principaleIndex: number) {
    const batiment = await this.prisma.batiment.findUnique({ where: { idBat: batimentId } });
    if (!batiment) throw new NotFoundException(`Bâtiment #${batimentId} non trouvé`);
    if (!files || files.length === 0) throw new BadRequestException('Aucun fichier fourni.');
    if (files.length > 10) throw new BadRequestException('Maximum 10 photos par upload.');

    const results: Array<{ success: boolean; photo?: any; error?: string }> = [];
    let successCount = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const estPrincipale = i === principaleIndex;

      try {
        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!allowedMimeTypes.includes(file.mimetype)) {
          results.push({ success: false, error: `${file.originalname}: Format non supporté` });
          continue;
        }
        if (file.size > 10 * 1024 * 1024) {
          results.push({ success: false, error: `${file.originalname}: Fichier trop volumineux (max 10 Mo)` });
          continue;
        }

        const key = R2Service.generateBatimentPhotoKey(batimentId, file.originalname);
        const { url } = await this.r2Service.uploadFile(key, file.buffer, file.mimetype);

        if (estPrincipale) {
          await this.prisma.batimentPhoto.updateMany({
            where: { batimentId, estPrincipale: true },
            data: { estPrincipale: false },
          });
        }

        const photo = await this.prisma.batimentPhoto.create({
          data: { key, url, originalName: file.originalname, mimeType: file.mimetype, fileSize: file.size, estPrincipale, batimentId },
        });

        results.push({ success: true, photo });
        successCount++;
      } catch (error) {
        this.logger.error(`Erreur upload ${file.originalname}: ${error}`);
        results.push({ success: false, error: `${file.originalname}: Erreur lors de l'upload` });
      }
    }

    await this.auditService.modification('BATIMENT', batimentId, `${successCount}/${files.length} photos ajoutées`);
    return { results, total: files.length, successCount };
  }

  async setPhotoPrincipale(batimentId: number, photoId: number, estPrincipale: boolean) {
    const photo = await this.prisma.batimentPhoto.findFirst({ where: { id: photoId, batimentId } });
    if (!photo) throw new NotFoundException(`Photo #${photoId} non trouvée`);

    if (estPrincipale) {
      await this.prisma.batimentPhoto.updateMany({
        where: { batimentId, estPrincipale: true },
        data: { estPrincipale: false },
      });
    }

    const updated = await this.prisma.batimentPhoto.update({ where: { id: photoId }, data: { estPrincipale } });
    await this.auditService.modification('BATIMENT', batimentId, `Photo ${estPrincipale ? 'définie comme principale' : 'retirée comme principale'}`);
    return updated;
  }

  async deletePhoto(batimentId: number, photoId: number) {
    const photo = await this.prisma.batimentPhoto.findFirst({ where: { id: photoId, batimentId } });
    if (!photo) throw new NotFoundException(`Photo #${photoId} non trouvée`);

    try {
      await this.r2Service.deleteFile(photo.key);
    } catch (error) {
      this.logger.warn(`Erreur lors de la suppression R2: ${photo.key}`, error);
    }

    await this.prisma.batimentPhoto.delete({ where: { id: photoId } });
    await this.auditService.modification('BATIMENT', batimentId, 'Photo supprimée');
  }

  // ─── Toilettes ──────────────────────────────────────

  async createToilette(batimentId: number, dto: CreateToiletteDto) {
    await this.findOne(batimentId);
    const toilette = await this.prisma.toilette.create({
      data: { ...dto, batimentId },
    });
    await this.auditService.modification('BATIMENT', batimentId, 'Toilette ajoutée');
    return toilette;
  }

  async updateToilette(id: number, batimentId: number, dto: UpdateToiletteDto) {
    const existing = await this.prisma.toilette.findFirst({ where: { idToilette: id, batimentId } });
    if (!existing) throw new NotFoundException(`Toilette #${id} non trouvée`);
    const toilette = await this.prisma.toilette.update({ where: { idToilette: id }, data: dto });
    await this.auditService.modification('BATIMENT', batimentId, 'Toilette modifiée');
    return toilette;
  }

  async deleteToilette(id: number, batimentId: number) {
    const existing = await this.prisma.toilette.findFirst({ where: { idToilette: id, batimentId } });
    if (!existing) throw new NotFoundException(`Toilette #${id} non trouvée`);
    await this.prisma.toilette.delete({ where: { idToilette: id } });
    await this.auditService.modification('BATIMENT', batimentId, 'Toilette supprimée');
  }
}
