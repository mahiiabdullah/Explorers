import type { Prisma, PrismaClient } from '../../generated/prisma/client'

export interface IQueryParams {
  searchTerm?: string
  page?: string | number
  limit?: string | number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  [key: string]: unknown
}

export interface IQueryConfig {
  searchableFields?: string[]
  filterableFields?: string[]
}

export interface IQueryResult<T> {
  data: T[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export type PrismaFindManyArgs = any
export type PrismaCountArgs = any
export type PrismaModelDelegate = {
  count: (args?: any) => Promise<number>
  findMany: (args?: any) => Promise<any[]>
}
export type PrismaWhereConditions = Record<string, unknown>
export type PrismaStringFilter = Prisma.StringFilter
export type PrismaNumberFilter = Prisma.IntFilter | Prisma.FloatFilter
