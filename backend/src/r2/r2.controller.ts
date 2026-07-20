import {
  Controller,
  Get,
  Query,
  Res,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';
import { Public } from '../common/decorators/public.decorator';
import https from 'node:https';
import http from 'node:http';

@Controller('r2')
export class R2Controller {
  private readonly logger = new Logger(R2Controller.name);
  private readonly allowedDomain: string;
  private readonly r2BucketName: string;

  constructor() {
    this.allowedDomain = process.env.R2_PUBLIC_URL ?? '';
    this.r2BucketName = process.env.R2_BUCKET_NAME ?? 'infradrenphotos';
  }

  @Get('proxy-image')
  @Public() // Accessible sans auth car utilisee dans le PDF public
  async proxyImage(
    @Query('url') url: string,
    @Res() res: Response,
  ) {
    if (!url || typeof url !== 'string') {
      throw new HttpException('Missing url parameter', HttpStatus.BAD_REQUEST);
    }

    // Securite : valider que l'URL commence par https
    if (!url.startsWith('https://')) {
      this.logger.warn(`Blocage proxy URL non HTTPS: ${url?.substring(0, 50)}`);
      throw new HttpException('Only HTTPS URLs are allowed', HttpStatus.FORBIDDEN);
    }

    // Securite : valider que l'URL provient de notre bucket R2
    if (
      this.allowedDomain &&
      !url.startsWith(this.allowedDomain)
    ) {
      this.logger.warn(
        `Blocage proxy vers domaine non autorise: ${url.substring(0, 80)}`,
      );
      throw new HttpException(
        'Invalid image source',
        HttpStatus.FORBIDDEN,
      );
    }

    // Si allowedDomain n'est pas configuré, vérifier au moins le nom du bucket
    if (
      !this.allowedDomain &&
      !url.includes(this.r2BucketName)
    ) {
      this.logger.warn(
        `Blocage proxy: URL ne contient pas le bucket "${this.r2BucketName}": ${url.substring(0, 80)}`,
      );
      throw new HttpException(
        'Invalid image source',
        HttpStatus.FORBIDDEN,
      );
    }

    try {
      const client = url.startsWith('https') ? https : http;

      client.get(
        url,
        (response) => {
          const contentType =
            response.headers['content-type'] || 'image/jpeg';
          res.setHeader('Content-Type', contentType);
          res.setHeader(
            'Access-Control-Allow-Origin',
            '*',
          );
          res.setHeader(
            'Cache-Control',
            'public, max-age=31536000, immutable',
          );
          response.pipe(res);
        },
      ).on('error', (err) => {
        this.logger.error(
          `Erreur proxy image: ${err.message}`,
        );
        res.status(HttpStatus.BAD_GATEWAY).end();
      });
    } catch {
      throw new HttpException(
        'Failed to proxy image',
        HttpStatus.BAD_GATEWAY,
      );
    }
  }
}
