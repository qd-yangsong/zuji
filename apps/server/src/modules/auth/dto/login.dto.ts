import { IsString, MinLength } from 'class-validator';

export class LoginDto {
  // 微信 wx.login() 返回的 code
  @IsString()
  @MinLength(1)
  code!: string;
}
