import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super({
      log: [{ emit: 'stdout', level: 'query' }],
    });
  }

  async onModuleInit() {
    await this.$connect();

    this.$use(async (params, next) => {
      if (params.action === 'findUnique' || params.action === 'findFirst') {
        // Change to findFirst - you cannot filter
        // by anything except ID / unique with findUnique
        params.action = 'findFirst';
        // Add 'deleted_at' filter
        // ID filter maintained
        params.args.where['deleted_at'] = null;
      }
      if (params.action === 'findMany') {
        // Find many queries
        if (params.args.where) {
          if (params.args.where.deleted_at == null) {
            // Exclude deleted_at records if they have not been explicitly requested
            params.args.where['deleted_at'] = null;
          }
        } else {
          params.args['where'] = { deleted_at: null };
        }
      }
      return next(params);
    });

    this.$use(async (params, next) => {
      if (params.action == 'update') {
        // Change to updateMany - you cannot filter
        // by anything except ID / unique with findUnique
        params.action = 'updateMany';
        // Add 'deleted_at' filter
        // ID filter maintained
        params.args.where['deleted_at'] = null;
      }
      if (params.action == 'updateMany') {
        if (params.args.where != undefined) {
          params.args.where['deleted_at'] = null;
        } else {
          params.args['where'] = { deleted_at: null };
        }
      }
      return next(params);
    });

    this.$use(async (params, next) => {
      // Check incoming query type
      if (params.action == 'delete') {
        // Delete queries
        // Change action to an update
        params.action = 'update';
        params.args['data'] = { deleted_at: new Date() };
      }
      if (params.action == 'deleteMany') {
        // Delete many queries
        params.action = 'updateMany';
        if (params.args.data != undefined) {
          params.args.data['deleted_at'] = new Date();
        } else {
          params.args['data'] = { deleted_at: new Date() };
        }
      }
      return next(params);
    });
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
