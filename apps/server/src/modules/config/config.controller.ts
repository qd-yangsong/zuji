import { Controller, Get } from '@nestjs/common';
import { ConfigService } from './config.service';

// 公开接口：小程序拉取配置，不需要鉴权
@Controller('config')
export class ConfigController {
  constructor(private readonly configService: ConfigService) {}

  // 小程序拉取当前生效的主题配置
  @Get('themes')
  getActiveTheme() {
    return this.configService.getActiveTheme();
  }
}
