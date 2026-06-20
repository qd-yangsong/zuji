import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './common/prisma/prisma.module';
import { CosModule } from './common/cos/cos.module';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { TagModule } from './modules/tag/tag.module';
import { TagGroupModule } from './modules/tag-group/tag-group.module';
import { PlaceModule } from './modules/place/place.module';
import { CheckInModule } from './modules/checkin/checkin.module';
import { CollectionModule } from './modules/collection/collection.module';
import { ShareModule } from './modules/share/share.module';
import { AdminAuthModule } from './modules/admin-auth/admin-auth.module';
import { AdminAssetModule } from './modules/admin-asset/admin-asset.module';
import { AdminThemeModule } from './modules/admin-theme/admin-theme.module';
import { ConfigModule as PublicConfigModule } from './modules/config/config.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    CosModule,
    UserModule,
    AuthModule,
    TagModule,
    TagGroupModule,
    PlaceModule,
    CheckInModule,
    CollectionModule,
    ShareModule,
    AdminAuthModule,
    AdminAssetModule,
    AdminThemeModule,
    PublicConfigModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
