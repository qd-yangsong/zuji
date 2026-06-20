import { Controller, Get, UseGuards } from '@nestjs/common';
import { CosService } from './cos.service';
import { JwtAuthGuard } from '../guards/jwt.guard';
import { CurrentUser } from '../decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('cos')
export class CosController {
  constructor(private cos: CosService) {}

  // 前端调用以获取 COS 直传凭证
  @Get('policy')
  policy(@CurrentUser() user: { id: string }) {
    return this.cos.buildUploadPolicy(user.id);
  }
}
