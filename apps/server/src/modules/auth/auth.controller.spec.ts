import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  const mockAuthService = {
    loginByWxCode: jest.fn().mockResolvedValue({
      token: 'mock-jwt',
      user: { id: 'u1', openid: 'ox' },
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();
    controller = module.get<AuthController>(AuthController);
  });

  it('应能根据 code 登录并返回 token', async () => {
    const result = await controller.login({ code: 'wx-code' });
    expect(result.token).toBe('mock-jwt');
    expect(mockAuthService.loginByWxCode).toHaveBeenCalledWith('wx-code');
  });
});
