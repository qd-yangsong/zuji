import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import axios from 'axios';
import { UserService } from '../user/user.service';

interface WxCode2SessionResp {
  openid?: string;
  unionid?: string;
  session_key?: string;
  errcode?: number;
  errmsg?: string;
}

@Injectable()
export class AuthService {
  constructor(
    private config: ConfigService,
    private jwt: JwtService,
    private userService: UserService,
  ) {}

  // code 换 openid + 落库 + 签 JWT
  async loginByWxCode(code: string) {
    const appid = this.config.get<string>('WX_APPID');
    const secret = this.config.get<string>('WX_SECRET');
    const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${appid}&secret=${secret}&js_code=${code}&grant_type=authorization_code`;
    const { data } = await axios.get<WxCode2SessionResp>(url);
    if (!data.openid) {
      throw new UnauthorizedException(`wx login failed: ${data.errmsg}`);
    }
    const user = await this.userService.upsertByOpenid(data.openid, data.unionid);
    const token = await this.jwt.signAsync({ sub: user.id, openid: user.openid });
    return { token, user };
  }
}
