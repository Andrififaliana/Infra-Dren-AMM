import { EtablissementsService } from './etablissements.service';

describe('EtablissementsService.findAll', () => {
  it('coerces page and limit to numbers before calling Prisma', async () => {
    const findMany = jest.fn().mockResolvedValue([]);
    const count = jest.fn().mockResolvedValue(0);

    const service = new EtablissementsService(
      {
        etablissement: {
          findMany,
          count,
        },
      } as any,
      {} as any,
      {} as any,
    );

    await service.findAll({ page: '2' as any, limit: '5' as any } as any);

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 5,
        take: 5,
      }),
    );
    expect(count).toHaveBeenCalledWith(expect.objectContaining({ where: {} }));
  });
});
