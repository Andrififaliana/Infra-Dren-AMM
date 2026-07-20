import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../common/services/audit.service';
import { R2Service } from '../../r2/r2.service';
import { CreateSalleDto } from './dto/create-salle.dto';
import { UpdateSalleDto } from './dto/update-salle.dto';
import { CreateOuvertureDto } from './dto/create-ouverture.dto';
import { UpdateOuvertureDto } from './dto/update-ouverture.dto';

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE = 10 * 1024 * 1024; // 10 Mo

@Injectable()
export class SallesService {
  private readonly logger = new Logger(SallesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly r2Service: R2Service,
  ) {}

  async create(dto: CreateSalleDto) {
    const salle = await this.prisma.salle.create({ data: dto });
    await this.auditService.creation('SALLE', salle.idSalle, salle.sigleSalle ?? `#${salle.idSalle}`);
    return salle;
  }

  async findAll(batimentId?: number) {
    const where = batimentId ? { batimentId } : {};
    return this.prisma.salle.findMany({
      where,
      include: { batiment: { select: { idBat: true, sigleBat: true } }, _count: { select: { equipements: true, ouvertures: true } } },
      orderBy: { niveauSalle: 'asc' },
    });
  }

  async findOne(id: number) {
    const salle = await this.prisma.salle.findUnique({
      where: { idSalle: id },
      include: {
        batiment: { select: { idBat: true, sigleBat: true } },
        equipements: true,
        ouvertures: true,
        photos: { orderBy: { estPrincipale: 'desc' } },
      },
    });
    if (!salle) throw new NotFoundException(`Salle #${id} non trouvée`);
    if (salle.photos?.length) {
      await this.signPhotoUrls(
        salle.photos as Array<{ key: string; url: string }>,
      );
    }
    return salle;
  }

  async update(id: number, dto: UpdateSalleDto) {
    await this.findOne(id);
    const salle = await this.prisma.salle.update({ where: { idSalle: id }, data: dto });
    await this.auditService.modification('SALLE', id, salle.sigleSalle ?? `#${id}`);
    return salle;
  }

  async remove(id: number) {
    const salle = await this.findOne(id);
    if (salle.photos?.length) {
      for (const photo of salle.photos) {
        try { await this.r2Service.deleteFile(photo.key); } catch { /* ignore */ }
      }
    }
    await this.prisma.salle.delete({ where: { idSalle: id } });
    await this.auditService.suppression('SALLE', id);
  }

  // ─── Ouvertures ────────────────────────────────────

  async createOuverture(salleId: number, dto: CreateOuvertureDto) {
    await this.findOne(salleId);
    const ouverture = await this.prisma.ouverture.create({
      data: { ...dto, salleId },
    });
    await this.auditService.modification('SALLE', salleId, 'Ouverture ajoutée');
    return ouverture;
  }

  async updateOuverture(id: number, salleId: number, dto: UpdateOuvertureDto) {
    const existing = await this.prisma.ouverture.findFirst({ where: { idOuvert: id, salleId } });
    if (!existing) throw new NotFoundException(`Ouverture #${id} non trouvée`);
    const ouverture = await this.prisma.ouverture.update({ where: { idOuvert: id }, data: dto });
    await this.auditService.modification('SALLE', salleId, 'Ouverture modifiée');
    return ouverture;
  }

  async deleteOuverture(id: number, salleId: number) {
    const existing = await this.prisma.ouverture.findFirst({ where: { idOuvert: id, salleId } });
    if (!existing) throw new NotFoundException(`Ouverture #${id} non trouvée`);
    await this.prisma.ouverture.delete({ where: { idOuvert: id } });
    await this.auditService.modification('SALLE', salleId, 'Ouverture supprimée');
  }

  // ─── Photos ─────────────────────────────────────────────

  async uploadPhoto(salleId: number, file: Express.Multer.File) {
    const salle = await this.findOne(salleId);

    if (!ALLOWED_MIME.includes(file.mimetype)) {
      throw new BadRequestException('Format non accepté (JPG, PNG, WebP, GIF uniquement)');
    }
    if (file.size > MAX_SIZE) {
      throw new BadRequestException('Fichier trop volumineux (max 10 Mo)');
    }

    const key = R2Service.generateSallePhotoKey(salleId, file.originalname);
    const { url } = await this.r2Service.uploadFile(key, file.buffer, file.mimetype);

    const photo = await this.prisma.sallePhoto.create({
      data: {
        key,
        url,
        originalName: file.originalname,
        mimeType: file.mimetype,
        fileSize: file.size,
        salleId,
        estPrincipale: (await this.prisma.sallePhoto.count({ where: { salleId } })) === 0,
      },
    });

    await this.auditService.modification('SALLE', salleId, 'Photo ajoutée');
    return photo;
  }

  async uploadMultiplePhotos(salleId: number, files: Express.Multer.File[]) {
    const results: Array<{ id: number; key: string; url: string; originalName: string | null; mimeType: string | null; fileSize: number | null; estPrincipale: boolean; salleId: number; createdAt: Date }> = [];
    for (const file of files) {
      results.push(await this.uploadPhoto(salleId, file));
    }
    return results;
  }

  async setPhotoPrincipale(salleId: number, photoId: number) {
    const photo = await this.prisma.sallePhoto.findFirst({ where: { id: photoId, salleId } });
    if (!photo) throw new NotFoundException('Photo non trouvée');

    await this.prisma.sallePhoto.updateMany({
      where: { salleId },
      data: { estPrincipale: false },
    });
    return this.prisma.sallePhoto.update({
      where: { id: photoId },
      data: { estPrincipale: true },
    });
  }

  async deletePhoto(salleId: number, photoId: number) {
    const photo = await this.prisma.sallePhoto.findFirst({ where: { id: photoId, salleId } });
    if (!photo) throw new NotFoundException('Photo non trouvée');

    try { await this.r2Service.deleteFile(photo.key); } catch { /* ignore */ }
    await this.prisma.sallePhoto.delete({ where: { id: photoId } });
    await this.auditService.modification('SALLE', salleId, 'Photo supprimée');
  }

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
}
