import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { EtablissementsModule } from './modules/etablissements/etablissements.module';
import { BatimentsModule } from './modules/batiments/batiments.module';
import { SallesModule } from './modules/salles/salles.module';
import { EquipementsModule } from './modules/equipements/equipements.module';
import { TrajetsModule } from './modules/trajets/trajets.module';
import { AleasModule } from './modules/aleas/aleas.module';
import { StatistiquesModule } from './modules/statistiques/statistiques.module';
import { LogsModule } from './modules/logs/logs.module';
import { BackupModule } from './modules/backup/backup.module';
import config from './config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    EtablissementsModule,
    BatimentsModule,
    SallesModule,
    EquipementsModule,
    TrajetsModule,
    AleasModule,
    StatistiquesModule,
    LogsModule,
    BackupModule,
  ],
})
export class AppModule {}
