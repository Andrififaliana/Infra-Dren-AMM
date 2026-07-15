import { Module } from '@nestjs/common';
import { BatimentsController } from './batiments.controller';
import { BatimentsService } from './batiments.service';

@Module({
  controllers: [BatimentsController],
  providers: [BatimentsService],
  exports: [BatimentsService],
})
export class BatimentsModule {}
