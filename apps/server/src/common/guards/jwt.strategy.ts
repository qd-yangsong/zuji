import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

export interface JwtPayload {
  sub: string;
  openid: string;
}

// JWT 策略：从 Bearer Token 提取 payload，验证后挂到 req.user
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get<string>('JWT_SECRET'),
    });
  }

  // payload 校验后，结果挂到 req.user
  async validate(payload: JwtPayload) {
    return { id: payload.sub, openid: payload.openid };
  }
}
