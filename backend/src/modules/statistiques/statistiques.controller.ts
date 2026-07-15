import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { StatistiquesService } from './statistiques.service';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Statistiques')
@Controller('statistiques')
export class StatistiquesController {
  constructor(private readonly service: StatistiquesService) {}

  @Get('globales')
  @Public()
  @ApiOperation({ summary: 'Statistiques globales' })
  getGlobales() { return this.service.getGlobales(); }

  @Get('par-dren')
  @Public()
  @ApiOperation({ summary: 'Statistiques par DREN' })
  getParDren() { return this.service.getParDren(); }

  @Get('par-cisco')
  @Public()
  @ApiOperation({ summary: 'Statistiques par CISCO' })
  getParCisco() { return this.service.getParCisco(); }

  @Get('couverture-reseau')
  @Public()
  @ApiOperation({ summary: 'Couverture réseau' })
  getCouvertureReseau() { return this.service.getCouvertureReseau(); }

  @Get('repartition-salles')
  @Public()
  @ApiOperation({ summary: 'Répartition des salles' })
  getRepartitionSalles() { return this.service.getRepartitionSalles(); }
}
