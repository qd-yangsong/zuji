import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 系统预设标签组
const SYSTEM_GROUPS = [
  { name: '陪伴场景', color: '#FF9F43', icon: '👨‍👩‍👧', tagType: 'scene' },
  { name: '社交场景', color: '#54A0FF', icon: '🤝', tagType: 'scene' },
  { name: '时间场景', color: '#5F27CD', icon: '📅', tagType: 'scene' },
  { name: '心情场景', color: '#00D2D3', icon: '🌙', tagType: 'scene' },
];

// 系统预设标签
const SYSTEM_TAGS: { name: string; type: string; groupName?: string }[] = [
  { name: '美食', type: 'attribute' },
  { name: '咖啡', type: 'attribute' },
  { name: '酒吧', type: 'attribute' },
  { name: '书店', type: 'attribute' },
  { name: '景点', type: 'attribute' },
  { name: '酒店', type: 'attribute' },
  { name: '博物馆', type: 'attribute' },
  { name: '公园', type: 'attribute' },
  { name: '商场', type: 'attribute' },
  { name: '办公地', type: 'attribute' },
  { name: '学校', type: 'attribute' },
  { name: '适合带孩子', type: 'scene', groupName: '陪伴场景' },
  { name: '适合带父母', type: 'scene', groupName: '陪伴场景' },
  { name: '适合带宠物', type: 'scene', groupName: '陪伴场景' },
  { name: '适合朋友小聚', type: 'scene', groupName: '社交场景' },
  { name: '适合招待重要客人', type: 'scene', groupName: '社交场景' },
  { name: '适合接待外地朋友', type: 'scene', groupName: '社交场景' },
  { name: '适合相亲约会', type: 'scene', groupName: '社交场景' },
  { name: '适合团建', type: 'scene', groupName: '社交场景' },
  { name: '适合日常去', type: 'scene', groupName: '时间场景' },
  { name: '适合周末', type: 'scene', groupName: '时间场景' },
  { name: '适合长假', type: 'scene', groupName: '时间场景' },
  { name: '适合工作日中午', type: 'scene', groupName: '时间场景' },
  { name: '适合深夜', type: 'scene', groupName: '时间场景' },
  { name: '适合一个人静一静', type: 'scene', groupName: '心情场景' },
  { name: '适合发呆', type: 'scene', groupName: '心情场景' },
  { name: '适合赶deadline', type: 'scene', groupName: '心情场景' },
  { name: '同学聚会', type: 'event' },
  { name: '单位年会', type: 'event' },
  { name: '家庭聚餐', type: 'event' },
  { name: '家长会', type: 'event' },
  { name: '剧本杀', type: 'event' },
  { name: '密室', type: 'event' },
  { name: '看演出', type: 'event' },
  { name: '看展', type: 'event' },
  { name: '度假', type: 'event' },
  { name: '出差', type: 'event' },
  { name: '约会', type: 'event' },
  { name: '生日庆祝', type: 'event' },
  { name: '纪念日', type: 'event' },
  { name: '闺蜜局', type: 'event' },
  { name: '兄弟局', type: 'event' },
];

async function main() {
  // 插入标签组（幂等：先查再插）
  const groupMap = new Map<string, string>();
  for (const g of SYSTEM_GROUPS) {
    const existing = await prisma.tagGroup.findFirst({
      where: { name: g.name, userId: null },
    });
    if (existing) {
      groupMap.set(g.name, existing.id);
      continue;
    }
    const created = await prisma.tagGroup.create({
      data: { name: g.name, color: g.color, icon: g.icon, tagType: g.tagType, isSystem: true, userId: null },
    });
    groupMap.set(g.name, created.id);
  }

  // 插入标签（幂等：先查再插）
  let insertedTags = 0;
  for (const t of SYSTEM_TAGS) {
    const existing = await prisma.tag.findFirst({
      where: { name: t.name, type: t.type, userId: null },
    });
    if (existing) continue;
    await prisma.tag.create({
      data: {
        name: t.name,
        type: t.type,
        groupId: t.groupName ? groupMap.get(t.groupName) ?? null : null,
        isSystem: true,
        userId: null,
        usageCount: 0,
      },
    });
    insertedTags++;
  }

  console.log(`已处理 ${SYSTEM_GROUPS.length} 个标签组, ${SYSTEM_TAGS.length} 个系统预设标签（新增 ${insertedTags} 个）`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });
