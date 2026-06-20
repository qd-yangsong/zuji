import { Module } from '@nestjs/common';
import { TagGroupController } from './tag-group.controller';
import { TagGroupService } from './tag-group.service';

@Module({
  controllers: [TagGroupController],
  providers: [TagGroupService],
  exports: [TagGroupService],
})
export class TagGroupModule {}
