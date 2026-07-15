import { Module } from '@nestjs/common';
import { EtablissementsController } from './etablissements.controller';
import { EtablissementsService } from './etablissements.service';
import { R2Module } from '../../r2/r2.module';

@Module({
  imports: [R2Module],
  controllers: [EtablissementsController],
  providers: [EtablissementsService],
  exports: [EtablissementsService],
})
export class EtablissementsModule {}
