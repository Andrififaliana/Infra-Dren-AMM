import { Module } from '@nestjs/common';
import { EquipementsController } from './equipements.controller';
import { EquipementsService } from './equipements.service';

@Module({
  controllers: [EquipementsController],
  providers: [EquipementsService],
})
export class EquipementsModule {}
