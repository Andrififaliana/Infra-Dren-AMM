import { Module } from '@nestjs/common';
import { BatimentsController } from './batiments.controller';
import { BatimentsService } from './batiments.service';
import { R2Module } from '../../r2/r2.module';

@Module({
  imports: [R2Module],
  controllers: [BatimentsController],
  providers: [BatimentsService],
  exports: [BatimentsService],
})
export class BatimentsModule {}
