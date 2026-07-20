import { Controller, Get, Post, Patch, Body, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../../common/guards/jwt.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { IsString, MaxLength, IsArray, ArrayMinSize } from 'class-validator';

class UpdateSignatureDto {
  @IsString()
  @MaxLength(50)
  signature!: string;
}

class UnlockStickerDto {
  @IsString()
  stickerId!: string;
}

class UnlockStickersDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  stickerIds!: string[];
}

@UseGuards(JwtAuthGuard)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // 获取已解锁的贴纸列表
  @Get('stickers')
  getStickerUnlocks(@CurrentUser() user: { id: string; openid: string }) {
    return this.userService.getStickerUnlocks(user.id);
  }

  // 解锁单个贴纸
  @Post('stickers/unlock')
  unlockSticker(
    @Body() dto: UnlockStickerDto,
    @CurrentUser() user: { id: string; openid: string },
  ) {
    return this.userService.unlockSticker(user.id, dto.stickerId);
  }

  // 批量解锁贴纸
  @Post('stickers/unlock-batch')
  unlockStickers(
    @Body() dto: UnlockStickersDto,
    @CurrentUser() user: { id: string; openid: string },
  ) {
    return this.userService.unlockStickers(user.id, dto.stickerIds);
  }

  // 更新签名
  @Patch('signature')
  updateSignature(
    @Body() dto: UpdateSignatureDto,
    @CurrentUser() user: { id: string; openid: string },
  ) {
    return this.userService.updateSignature(user.id, dto.signature);
  }
}
