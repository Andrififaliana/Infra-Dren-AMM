import { Module } from '@nestjs/common';
import { AleasController } from './aleas.controller';
import { AleasService } from './aleas.service';

@Module({
  controllers: [AleasController],
  providers: [AleasService],
})
export class AleasModule {}
