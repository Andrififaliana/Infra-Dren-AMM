import { Module } from '@nestjs/common';
import { ChatIaController } from './chat-ia.controller';
import { ChatIaService } from './chat-ia.service';
import { IaMonitoringService } from './ia-monitoring.service';

@Module({
  controllers: [ChatIaController],
  providers: [ChatIaService, IaMonitoringService],
  exports: [ChatIaService, IaMonitoringService],
})
export class ChatIaModule {}
