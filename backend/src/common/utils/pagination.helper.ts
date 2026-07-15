export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}

/**
 * Calcule le skip pour la pagination Prisma.
 */
export function getPaginationSkip(page: number, limit: number): number {
  return (page - 1) * limit;
}

/**
 * Construit la réponse paginée standardisée pour Prisma.
 */
export async function paginate<T>(
  model: {
    findMany: (args: {
      where?: any;
      skip?: number;
      take?: number;
      include?: any;
      select?: any;
      orderBy?: any;
    }) => Promise<T[]>;
    count: (args: { where?: any }) => Promise<number>;
  },
  params: {
    where?: any;
    include?: any;
    select?: any;
    orderBy?: any;
    page?: number;
    limit?: number;
  },
): Promise<PaginatedResult<T>> {
  const page = Math.max(1, params.page ?? 1);
  const limit = Math.min(100, Math.max(1, params.limit ?? 10));
  const skip = getPaginationSkip(page, limit);

  const { page: _p, limit: _l, where, include, select, orderBy, ...rest } = params;

  const [data, total] = await Promise.all([
    model.findMany({
      where: where ?? rest,
      skip,
      take: limit,
      include,
      select,
      orderBy: orderBy ?? { id: 'asc' as const },
    }),
    model.count({ where: where ?? rest }),
  ]);

  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Extrait et valide les paramètres de pagination depuis une query.
 */
export function extractPagination(query: {
  page?: string | number;
  limit?: string | number;
}): Required<PaginationParams> {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 10));
  return { page, limit };
}
