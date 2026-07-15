import {
  PipeTransform,
  Injectable,
  BadRequestException,
} from '@nestjs/common';

@Injectable()
export class ParsePositiveIntPipe implements PipeTransform<string, number> {
  transform(value: string): number {
    const parsed = parseInt(value, 10);

    if (isNaN(parsed) || parsed < 1) {
      throw new BadRequestException(
        `L'identifiant '${value}' n'est pas un nombre entier valide`,
      );
    }

    return parsed;
  }
}
