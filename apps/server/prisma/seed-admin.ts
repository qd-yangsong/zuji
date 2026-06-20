import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// 管理员账号种子脚本
// 用法: ts-node prisma/seed-admin.ts [username] [password] [nickname]
async function main() {
  const username = process.argv[2] || 'admin';
  const password = process.argv[3] || 'admin123456';
  const nickname = process.argv[4] || '超级管理员';

  const hashedPassword = await bcrypt.hash(password, 10);

  // 用 openid = username 作为管理员账号标识
  const admin = await prisma.user.upsert({
    where: { openid: username },
    update: {
      role: 'admin',
      password: hashedPassword,
      nickname,
      status: 'active',
    },
    create: {
      openid: username,
      role: 'admin',
      password: hashedPassword,
      nickname,
      status: 'active',
    },
  });

  console.log('管理员账号创建/更新成功：');
  console.log(`  用户名: ${username}`);
  console.log(`  密码: ${password}`);
  console.log(`  ID: ${admin.id}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
