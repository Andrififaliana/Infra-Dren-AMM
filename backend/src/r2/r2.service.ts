import { Injectable, Logger } from '@nestjs/common';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class R2Service {
  private readonly logger = new Logger(R2Service.name);
  private s3: S3Client;
  private bucketName: string;
  private publicUrlBase: string;
  private accountId: string;

  constructor() {
    this.accountId = process.env.R2_ACCOUNT_ID ?? '';
    this.bucketName = process.env.R2_BUCKET_NAME ?? 'infradrenphotos';

    // Support custom endpoint (e.g. custom domain) or build from account ID
    const endpoint =
      process.env.R2_ENDPOINT ?? `https://${this.accountId}.r2.cloudflarestorage.com`;
    this.publicUrlBase =
      process.env.R2_PUBLIC_URL ??
      `https://${this.bucketName}.${this.accountId}.r2.cloudflarestorage.com`;

    this.s3 = new S3Client({
      region: 'auto',
      endpoint,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID ?? '',
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? '',
      },
    });
  }

  /** Uploader un fichier vers R2 */
  async uploadFile(
    key: string,
    body: Buffer,
    contentType: string,
  ): Promise<{ key: string; url: string }> {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: body,
      ContentType: contentType,
    });

    await this.s3.send(command);
    this.logger.log(`Fichier uploadé: ${key}`);

    return {
      key,
      url: `${this.publicUrlBase}/${key}`,
    };
  }

  /** Générer une URL présignée (temporaire) pour accéder à un fichier privé */
  async getPresignedUrl(key: string, expiresIn = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });
    return getSignedUrl(this.s3, command, { expiresIn });
  }

  /** Supprimer un fichier de R2 */
  async deleteFile(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    await this.s3.send(command);
    this.logger.log(`Fichier supprimé: ${key}`);
  }

  /** Générer une clé unique pour une photo d'établissement */
  static generatePhotoKey(
    etablissementId: number,
    originalName: string,
  ): string {
    const timestamp = Date.now();
    const sanitizedName = originalName.replace(/[^a-zA-Z0-9._-]/g, '_');
    return `etablissements/${etablissementId}/${timestamp}-${sanitizedName}`;
  }
}
