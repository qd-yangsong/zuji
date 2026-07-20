import { Controller, Get, Param } from '@nestjs/common';
import { ShareService } from './share.service';

// 公开接口：不需要 JWT 鉴权，任何人都能通过分享链接访问
@Controller('share')
export class ShareController {
  constructor(private readonly shareService: ShareService) {}

  // 查看分享的地点
  @Get('place/:id')
  getSharedPlace(@Param('id') id: string) {
    return this.shareService.getSharedPlace(id);
  }

  // 查看分享的合集（向后兼容）
  @Get('collection/:id')
  getSharedCollection(@Param('id') id: string) {
    return this.shareService.getSharedCollection(id);
  }

  // 查看分享的路线
  @Get('route/:id')
  getSharedRoute(@Param('id') id: string) {
    return this.shareService.getSharedRoute(id);
  }
}
