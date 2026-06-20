import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

// 全局模块，其他模块无需显式导入即可注入 PrismaService
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
