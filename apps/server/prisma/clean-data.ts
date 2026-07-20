/**
 * 数据清理脚本 —— 清空所有用户生成数据，保留系统预设数据
 * 用法: npx ts-node prisma/clean-data.ts
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clean() {
  console.log('🧹 开始清理测试数据...\n');

  // 按外键依赖顺序删除（先删子表再删主表）
  console.log('  → 清空打卡标签关联...');
  await prisma.checkInTag.deleteMany();

  console.log('  → 清空打卡记录...');
  await prisma.checkIn.deleteMany();

  console.log('  → 清空地点标签关联...');
  await prisma.placeTag.deleteMany();

  console.log('  → 清空合集地点关联...');
  await prisma.collectionPlace.deleteMany();

  console.log('  → 清空地点...');
  await prisma.place.deleteMany();

  console.log('  → 清空合集...');
  await prisma.collection.deleteMany();

  console.log('  → 清空反馈...');
  await prisma.feedback.deleteMany();

  console.log('  → 清空普通用户（保留管理员账号）...');
  await prisma.user.deleteMany({ where: { role: 'user' } });

  // 以下系统数据保留不删:
  // - tags / tag_groups（系统预设标签）
  // - assets（管理员上传素材）
  // - theme_configs（主题配置）
  // - announcements（公告）
  // - admin_logs（操作日志）
  // - users（role='admin'的管理员账号）

  console.log('\n✅ 清理完成！');
}

clean()
  .catch((e) => {
    console.error('❌ 清理失败:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
